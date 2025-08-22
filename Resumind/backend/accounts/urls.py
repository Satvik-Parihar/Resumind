from django.urls import path
from .views import RegisterView, LoginView, logout_and_clear_media

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout-clear-media/', logout_and_clear_media, name='logout-clear-media'),
]
