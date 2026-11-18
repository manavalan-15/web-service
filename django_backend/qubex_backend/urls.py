from django.contrib import admin
from django.urls import include, path
from enquiries.views import RootStatusView

urlpatterns = [
    path("", RootStatusView.as_view(), name="root-status"),
    path("django-admin/", admin.site.urls),
    path("api/", include("enquiries.urls")),
]
