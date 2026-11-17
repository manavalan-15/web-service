from django.urls import path
from .views import (
    AdminEnquiryDetailView,
    AdminEnquiryExportView,
    AdminEnquiryListView,
    AdminLoginView,
    AdminLogoutView,
    AdminSessionView,
    CsrfTokenView,
    PublicEnquiryCreateView,
)

urlpatterns = [
    path("csrf-token", CsrfTokenView.as_view(), name="csrf-token"),
    path("enquiries", PublicEnquiryCreateView.as_view(), name="enquiry-create"),
    path("admin/auth/login", AdminLoginView.as_view(), name="admin-login"),
    path("admin/auth/me", AdminSessionView.as_view(), name="admin-me"),
    path("admin/auth/logout", AdminLogoutView.as_view(), name="admin-logout"),
    path("admin/enquiries", AdminEnquiryListView.as_view(), name="admin-enquiries-list"),
    path("admin/enquiries/export", AdminEnquiryExportView.as_view(), name="admin-enquiries-export"),
    path("admin/enquiries/<int:pk>", AdminEnquiryDetailView.as_view(), name="admin-enquiry-detail"),
]
