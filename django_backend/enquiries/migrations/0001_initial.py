from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="ProjectEnquiry",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("full_name", models.CharField(max_length=150)),
                ("email", models.EmailField(max_length=255)),
                ("phone", models.CharField(max_length=50)),
                ("company_name", models.CharField(blank=True, default="", max_length=150)),
                ("service_required", models.CharField(max_length=150)),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("New", "New"),
                            ("Contacted", "Contacted"),
                            ("In Progress", "In Progress"),
                            ("Completed", "Completed"),
                            ("Rejected", "Rejected"),
                        ],
                        db_index=True,
                        default="New",
                        max_length=30,
                    ),
                ),
                ("admin_notes", models.TextField(blank=True, default="")),
                ("created_at", models.DateTimeField(auto_now_add=True, db_index=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "db_table": "project_enquiries",
                "ordering": ["-created_at", "-id"],
            },
        ),
    ]
