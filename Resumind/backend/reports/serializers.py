from rest_framework import serializers
from .models import Report
from resumes.models import Resume  # noqa: F401
from resumes.serializers import ResumeSerializer
import json  # noqa: F401

class ReportSerializer(serializers.ModelSerializer):
    resume = ResumeSerializer(read_only=True)
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = Report
        fields = [
            "id",
            "resume",
            "file_url",
            "score",
            "details",
        ]

    def get_file_url(self, obj):
        resume = obj.resume
        request = self.context.get("request")
        if resume and resume.file and hasattr(resume.file, "url"):
            if request:
                return request.build_absolute_uri(resume.file.url)
            return resume.file.url
        return None
