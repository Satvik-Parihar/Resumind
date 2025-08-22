from django.urls import path
from .views import ResumeUploadView, resume_list, resume_detail, resume_delete, resume_bulk_delete

urlpatterns = [
    path("upload/", ResumeUploadView.as_view(), name="resume-upload"),
    path("", resume_list, name="resume-list"),
    path("<int:pk>/", resume_detail, name="resume-detail"),
    path("<int:pk>/delete/", resume_delete, name="resume-delete"),
    path("bulk-delete/", resume_bulk_delete, name="resume-bulk-delete"),
]
