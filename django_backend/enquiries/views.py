import csv
import logging
from io import BytesIO
from django.conf import settings
from django.contrib.auth import authenticate, login, logout
from django.core.mail import send_mail
from django.db.models import Count, Q
from django.http import HttpResponse
from django.middleware.csrf import get_token
from openpyxl import Workbook
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import ProjectEnquiry
from .serializers import (
    ProjectEnquiryAdminSerializer,
    ProjectEnquiryCreateSerializer,
)

logger = logging.getLogger(__name__)


def filter_enquiries_queryset(request):
    qs = ProjectEnquiry.objects.all()
    search = request.query_params.get("search", "").strip()
    status_val = request.query_params.get("status", "").strip()
    service = request.query_params.get("service", "").strip()
    date_from = request.query_params.get("dateFrom", "").strip()
    date_to = request.query_params.get("dateTo", "").strip()

    if status_val and status_val != "All":
        qs = qs.filter(status=status_val)
    if service and service != "All":
        qs = qs.filter(service_required=service)
    if date_from:
        qs = qs.filter(created_at__date__gte=date_from)
    if date_to:
        qs = qs.filter(created_at__date__lte=date_to)
    if search:
        qs = qs.filter(
            Q(full_name__icontains=search)
            | Q(email__icontains=search)
            | Q(phone__icontains=search)
            | Q(company_name__icontains=search)
            | Q(service_required__icontains=search)
        )
    return qs


class CsrfTokenView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({"csrfToken": get_token(request)})


class PublicEnquiryCreateView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ProjectEnquiryCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {
                    "error": "Please correct the highlighted fields and try again.",
                    "fieldErrors": serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        enquiry = serializer.save()
        ref_id = f"QB-{enquiry.id:05d}"

        email_sent = False
        try:
            if settings.EMAIL_HOST_USER and settings.EMAIL_HOST_PASSWORD:
                send_mail(
                    subject=f"New Project Enquiry ({ref_id}) · {enquiry.service_required}",
                    message=(
                        f"Reference ID: {ref_id}\n"
                        f"Name: {enquiry.full_name}\n"
                        f"Email: {enquiry.email}\n"
                        f"Phone: {enquiry.phone}\n"
                        f"Company: {enquiry.company_name or 'Not provided'}\n"
                        f"Service: {enquiry.service_required}\n"
                        f"Submitted At: {enquiry.created_at.isoformat()}"
                    ),
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[settings.ADMIN_NOTIFICATION_EMAIL],
                    fail_silently=False,
                )
                email_sent = True
        except Exception as exc:
            logger.error("Failed to send admin email for %s: %s", ref_id, exc)

        return Response(
            {
                "success": True,
                "referenceId": ref_id,
                "submittedAt": enquiry.created_at.isoformat(),
                "emailNotificationSent": email_sent,
                "message": "Your project enquiry has been saved securely.",
                "enquiry": serializer.data,
            },
            status=status.HTTP_201_CREATED,
        )


class AdminLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        identifier = str(request.data.get("email") or request.data.get("username") or "").strip()
        password = str(request.data.get("password") or "")
        user = authenticate(request, username=identifier, password=password)
        if user is None or not user.is_staff:
            return Response(
                {"error": "Invalid administrator credentials."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        login(request, user)
        return Response(
            {
                "authenticated": True,
                "csrfToken": get_token(request),
                "admin": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "role": "admin",
                },
            }
        )


class AdminSessionView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        return Response(
            {
                "authenticated": True,
                "csrfToken": get_token(request),
                "admin": {
                    "id": request.user.id,
                    "username": request.user.username,
                    "email": request.user.email,
                    "role": "admin",
                },
            }
        )


class AdminLogoutView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        logout(request)
        return Response({"success": True})


class AdminEnquiryListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        qs = filter_enquiries_queryset(request)
        serializer = ProjectEnquiryAdminSerializer(qs, many=True)
        agg = ProjectEnquiry.objects.aggregate(
            total=Count("id"),
            newCount=Count("id", filter=Q(status=ProjectEnquiry.Status.NEW)),
            contactedCount=Count("id", filter=Q(status=ProjectEnquiry.Status.CONTACTED)),
            inProgressCount=Count("id", filter=Q(status=ProjectEnquiry.Status.IN_PROGRESS)),
            completedCount=Count("id", filter=Q(status=ProjectEnquiry.Status.COMPLETED)),
            rejectedCount=Count("id", filter=Q(status=ProjectEnquiry.Status.REJECTED)),
        )
        return Response({"enquiries": serializer.data, "stats": agg})


class AdminEnquiryDetailView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, pk: int):
        enquiry = ProjectEnquiry.objects.filter(pk=pk).first()
        if not enquiry:
            return Response({"error": "Enquiry not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response({"enquiry": ProjectEnquiryAdminSerializer(enquiry).data})

    def patch(self, request, pk: int):
        enquiry = ProjectEnquiry.objects.filter(pk=pk).first()
        if not enquiry:
            return Response({"error": "Enquiry not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = ProjectEnquiryAdminSerializer(enquiry, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response({"enquiry": serializer.data})

    def delete(self, request, pk: int):
        enquiry = ProjectEnquiry.objects.filter(pk=pk).first()
        if not enquiry:
            return Response({"error": "Enquiry not found."}, status=status.HTTP_404_NOT_FOUND)
        enquiry.delete()
        return Response({"success": True})


class AdminEnquiryExportView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        export_format = request.query_params.get("format", "csv").lower()
        enquiries = filter_enquiries_queryset(request)

        headers = [
            "Reference ID", "Full Name", "Email", "Phone", "Company Name",
            "Service Required", "Status", "Admin Notes", "Submitted At", "Updated At",
        ]

        if export_format in ("xlsx", "excel"):
            wb = Workbook()
            ws = wb.active
            ws.title = "Project Enquiries"
            ws.append(headers)
            for item in enquiries:
                ws.append([
                    f"QB-{item.id:05d}",
                    item.full_name,
                    item.email,
                    item.phone,
                    item.company_name,
                    item.service_required,
                    item.status,
                    item.admin_notes,
                    item.created_at.isoformat(),
                    item.updated_at.isoformat(),
                ])
            output = BytesIO()
            wb.save(output)
            response = HttpResponse(
                output.getvalue(),
                content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            )
            response["Content-Disposition"] = 'attachment; filename="qubex-enquiries.xlsx"'
            return response

        response = HttpResponse(content_type="text/csv; charset=utf-8")
        response["Content-Disposition"] = 'attachment; filename="qubex-enquiries.csv"'
        writer = csv.writer(response)
        writer.writerow(headers)
        for item in enquiries:
            writer.writerow([
                f"QB-{item.id:05d}",
                item.full_name,
                item.email,
                item.phone,
                item.company_name,
                item.service_required,
                item.status,
                item.admin_notes,
                item.created_at.isoformat(),
                item.updated_at.isoformat(),
            ])
        return response
