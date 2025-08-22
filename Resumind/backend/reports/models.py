from django.db import models
from resumes.models import Resume

class Report(models.Model):
    resume = models.ForeignKey(Resume, on_delete=models.CASCADE, related_name='reports')
    created_at = models.DateTimeField(auto_now_add=True)
    score = models.FloatField(null=True, blank=True)
    details = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return f"Report {self.id} for Resume {self.resume.id}"
