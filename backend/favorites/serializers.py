from rest_framework import serializers

from .models import Favorite


class FavoriteSerializer(serializers.ModelSerializer):
    trick_slug = serializers.CharField(source="trick.slug", read_only=True)
    trick_name = serializers.CharField(source="trick.name", read_only=True)

    class Meta:
        model = Favorite
        fields = ["id", "trick_slug", "trick_name", "created_at"]
