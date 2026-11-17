import re
from rest_framework import serializers
from .models import ProjectEnquiry


class ProjectEnquiryCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectEnquiry
        fields = [
            "id",
            "full_name",
            "email",
            "phone",
            "company_name",
            "service_required",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def validate_full_name(self, value: str) -> str:
        cleaned = value.strip()
        if len(cleaned) < 2:
            raise serializers.ValidationError("Full name must be at least 2 characters.")
        return cleaned

    def validate_phone(self, value: str) -> str:
        cleaned = value.strip()
        digits = re.sub(r"[\s\-().+]", "", cleaned)
        if len(digits) < 7 or not digits.isdigit():
            raise serializers.ValidationError("Please enter a valid phone number.")
        return cleaned


class ProjectEnquiryAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectEnquiry
        fields = [
            "id",
            "full_name",
            "email",
            "phone",
            "company_name",
            "service_required",
            "status",
            "admin_notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
