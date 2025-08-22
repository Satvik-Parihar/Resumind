from rest_framework import serializers
from .models import JobSelection

class JobSelectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobSelection
        fields = "__all__"
