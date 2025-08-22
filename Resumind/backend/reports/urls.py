from django.urls import path
from .views import reports_list, report_detail

urlpatterns = [
    path("", reports_list, name="reports-list"),
    path("<int:pk>/", report_detail, name="report-detail"),
]
