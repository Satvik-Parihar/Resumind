from django.contrib import admin
from .models import Resume

@admin.register(Resume)
class ResumeAdmin(admin.ModelAdmin):
    list_display = ("id", "owner", "uploaded_at", "status")
    readonly_fields = ("parsed_text", "skills", "summary")
    list_filter = ("status",)
