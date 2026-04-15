from rest_framework import serializers

from .models import Phase, Tag, Trick, Video


class VideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Video
        fields = [
            "id",
            "youtube_url",
            "title",
            "channel_name",
            "duration_seconds",
            "timestamp_seconds",
            "order",
        ]


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ["id", "name", "slug"]


class TrickPrerequisiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trick
        fields = ["id", "name", "slug", "difficulty"]


class TrickListSerializer(serializers.ModelSerializer):
    phase_name = serializers.CharField(source="phase.name", read_only=True)
    phase_id = serializers.IntegerField(source="phase.id", read_only=True)
    prerequisite_ids = serializers.PrimaryKeyRelatedField(
        source="prerequisites", many=True, read_only=True
    )
    tags = TagSerializer(many=True, read_only=True)
    video_count = serializers.IntegerField(source="videos.count", read_only=True)
    favorite_count = serializers.IntegerField(source="favorited_by.count", read_only=True)

    class Meta:
        model = Trick
        fields = [
            "id",
            "name",
            "slug",
            "description",
            "difficulty",
            "phase_id",
            "phase_name",
            "prerequisite_ids",
            "tags",
            "video_count",
            "favorite_count",
            "demo_gif_url",
            "is_community",
        ]


class TrickDetailSerializer(serializers.ModelSerializer):
    phase_name = serializers.CharField(source="phase.name", read_only=True)
    phase_id = serializers.IntegerField(source="phase.id", read_only=True)
    videos = VideoSerializer(many=True, read_only=True)
    prerequisites = TrickPrerequisiteSerializer(many=True, read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    created_by_name = serializers.SerializerMethodField()
    favorite_count = serializers.IntegerField(source="favorited_by.count", read_only=True)

    class Meta:
        model = Trick
        fields = [
            "id",
            "name",
            "slug",
            "description",
            "difficulty",
            "pro_tip",
            "phase_id",
            "phase_name",
            "videos",
            "prerequisites",
            "tags",
            "favorite_count",
            "demo_gif_url",
            "is_community",
            "created_by_name",
            "created_at",
            "updated_at",
        ]

    def get_created_by_name(self, obj):
        if obj.created_by and hasattr(obj.created_by, "profile"):
            return obj.created_by.profile.display_name
        return None


class TrickInPhaseSerializer(serializers.ModelSerializer):
    prerequisite_ids = serializers.PrimaryKeyRelatedField(
        source="prerequisites", many=True, read_only=True
    )
    video_count = serializers.IntegerField(source="videos.count", read_only=True)
    favorite_count = serializers.IntegerField(source="favorited_by.count", read_only=True)

    class Meta:
        model = Trick
        fields = [
            "id",
            "name",
            "slug",
            "description",
            "difficulty",
            "prerequisite_ids",
            "video_count",
            "favorite_count",
            "demo_gif_url",
            "is_community",
        ]


class PhaseWithTricksSerializer(serializers.ModelSerializer):
    tricks = TrickInPhaseSerializer(many=True, read_only=True)

    class Meta:
        model = Phase
        fields = ["id", "name", "order", "description", "tricks"]


class CommunityTrickSubmitSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=200)
    description = serializers.CharField()
    difficulty = serializers.IntegerField(min_value=1, max_value=10)
    pro_tip = serializers.CharField(required=False, allow_blank=True, default="")
    phase_id = serializers.IntegerField()
    video_urls = serializers.ListField(
        child=serializers.URLField(), min_length=1, max_length=10
    )
    video_titles = serializers.ListField(
        child=serializers.CharField(max_length=300), required=False
    )
    video_channels = serializers.ListField(
        child=serializers.CharField(max_length=200), required=False
    )

    def validate_phase_id(self, value):
        if not Phase.objects.filter(id=value).exists():
            raise serializers.ValidationError("Phase does not exist.")
        return value

    def create(self, validated_data):
        from django.utils.text import slugify

        user = self.context["request"].user
        phase = Phase.objects.get(id=validated_data["phase_id"])
        video_urls = validated_data.pop("video_urls")
        video_titles = validated_data.pop("video_titles", [])
        video_channels = validated_data.pop("video_channels", [])
        validated_data.pop("phase_id")

        slug = slugify(validated_data["name"])
        base_slug = slug
        counter = 1
        while Trick.objects.filter(slug=slug).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1

        trick = Trick.objects.create(
            **validated_data,
            slug=slug,
            phase=phase,
            is_community=True,
            created_by=user,
        )

        for i, url in enumerate(video_urls):
            Video.objects.create(
                trick=trick,
                youtube_url=url,
                title=video_titles[i] if i < len(video_titles) else f"Video {i + 1}",
                channel_name=video_channels[i] if i < len(video_channels) else "Community",
                duration_seconds=0,
                order=i,
            )

        return trick
