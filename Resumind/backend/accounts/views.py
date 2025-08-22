from rest_framework import generics, status
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import get_user_model
from django.conf import settings
import os
import shutil
from resumes.models import Resume
from reports.models import Report
from .serializers import RegisterSerializer, MyTokenObtainPairSerializer
from resumes.utils import delete_resumes_by_ids

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]
    queryset = User.objects.all()


class LoginView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_and_clear_media(request):
    user = request.user
    ids = list(Resume.objects.filter(owner=user).values_list("id", flat=True))
    if ids:
        delete_resumes_by_ids(user, ids)
    Report.objects.filter(resume__owner=user).delete()
    resume_folder = os.path.join(settings.MEDIA_ROOT, "resumes")
    if os.path.exists(resume_folder) and not os.listdir(resume_folder):
        shutil.rmtree(resume_folder, ignore_errors=True)
    return Response({"detail": "Logged out successfully"}, status=status.HTTP_200_OK)
