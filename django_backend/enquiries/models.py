from django.db import models


class ProjectEnquiry(models.Model):
    class Status(models.TextChoices):
        NEW = "New", "New"
        CONTACTED = "Contacted", "Contacted"
        IN_PROGRESS = "In Progress", "In Progress"
        COMPLETED = "Completed", "Completed"
        REJECTED = "Rejected", "Rejected"

    full_name = models.CharField(max_length=150)
    email = models.EmailField(max_length=255)
    phone = models.CharField(max_length=50)
    company_name = models.CharField(max_length=150, blank=True, default="")
    service_required = models.CharField(max_length=150)
    status = models.CharField(
        max_length=30,
        choices=Status.choices,
        default=Status.NEW,
        db_index=True,
    )
    admin_notes = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "project_enquiries"
        ordering = ["-created_at", "-id"]

    def __str__(self) -> str:
        return f"QB-{self.id:05d} · {self.full_name} ({self.service_required})"
