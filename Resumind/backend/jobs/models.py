from django.db import models

class JobSelection(models.Model):
    job_title = models.CharField(max_length=255)
    skills = models.JSONField(default=list, blank=True)  # ✅ works with MySQL
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.job_title} ({len(self.skills)} skills)"
