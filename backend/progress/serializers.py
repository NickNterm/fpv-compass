from rest_framework import serializers

from .models import UserProgress


class UserProgressSerializer(serializers.ModelSerializer):
    trick_slug = serializers.CharField(source="trick.slug", read_only=True)
    trick_name = serializers.CharField(source="trick.name", read_only=True)

    class Meta:
        model = UserProgress
        fields = ["id", "trick_slug", "trick_name", "learned_at"]
