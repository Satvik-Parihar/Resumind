from rest_framework import serializers
from .models import Resume
import json

class ResumeSerializer(serializers.ModelSerializer):
    summary = serializers.SerializerMethodField()
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = Resume
        fields = [
            "id",
            "file",
            "file_url",
            "uploaded_at",
            "owner",
            "parsed_text",
            "skills",
            "summary",
            "status",
        ]
        read_only_fields = ["uploaded_at", "parsed_text", "skills", "summary", "status"]

    def get_summary(self, obj):
        try:
            return json.loads(obj.summary) if obj.summary else {}
        except Exception:
            return {}

    def get_file_url(self, obj):
        request = self.context.get("request")
        if obj.file and hasattr(obj.file, "url"):
            return request.build_absolute_uri(obj.file.url) if request else obj.file.url
        return None
