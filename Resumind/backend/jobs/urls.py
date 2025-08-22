from django.urls import path
from .views import jobs, get_skills

urlpatterns = [
    path("", jobs, name="jobs"),
    path("skills/", get_skills, name="get-skills"),
]
