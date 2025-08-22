from django.db import models
from django.conf import settings
import json

class Resume(models.Model):
    file = models.FileField(upload_to="resumes/")
    uploaded_at = models.DateTimeField(auto_now_add=True)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="resumes"
    )
    parsed_text = models.TextField(blank=True, null=True)
    skills = models.TextField(blank=True, null=True)
    certifications = models.TextField(blank=True, null=True)
    education = models.TextField(blank=True, null=True)
    projects = models.IntegerField(blank=True, null=True, default=0)
    summary = models.TextField(blank=True, null=True)

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("processed", "Processed"),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")

    class Meta:
        ordering = ["-uploaded_at"]

    def __str__(self):
        return f"{self.file.name} ({self.owner.email})"

    def clean(self):
        if self.summary:
            try:
                summary_data = json.loads(self.summary)
                email = summary_data.get("email")
                phone = summary_data.get("phone")
                linkedin = summary_data.get("linkedin")
                github = summary_data.get("github")
                name = summary_data.get("name")
                qs = Resume.objects.filter(owner=self.owner)
                for field_value in [email, phone, linkedin, github, name]:
                    if field_value and qs.filter(summary__contains=f'"{field_value}"').exists():
                        raise models.ValidationError(f"Resume with {field_value} already exists for this owner.")
            except json.JSONDecodeError:
                pass

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
