from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    is_company = models.BooleanField(default=False)
    is_applicant = models.BooleanField(default=True)
    full_name = models.CharField(max_length=255, blank=True)
    phone = models.CharField(max_length=30, blank=True)
    company_name = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return self.username
