from rest_framework import serializers

from .models import Idea, IdeaComment


class IdeaCommentSerializer(serializers.ModelSerializer):
    author = serializers.SerializerMethodField()

    class Meta:
        model = IdeaComment
        fields = ["id", "author", "body", "created_at"]

    def get_author(self, obj):
        if hasattr(obj.user, "profile"):
            return obj.user.profile.display_name
        return obj.user.username


class IdeaListSerializer(serializers.ModelSerializer):
    author = serializers.SerializerMethodField()
    vote_count = serializers.IntegerField(read_only=True)
    user_vote = serializers.SerializerMethodField()
    comment_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Idea
        fields = [
            "id",
            "title",
            "body",
            "category",
            "status",
            "author",
            "vote_count",
            "user_vote",
            "comment_count",
            "created_at",
        ]

    def get_author(self, obj):
        if hasattr(obj.user, "profile"):
            return obj.user.profile.display_name
        return obj.user.username

    def get_user_vote(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return None
        vote = obj.votes.filter(user=request.user).first()
        return vote.value if vote else None


class IdeaDetailSerializer(IdeaListSerializer):
    comments = IdeaCommentSerializer(many=True, read_only=True)

    class Meta(IdeaListSerializer.Meta):
        fields = IdeaListSerializer.Meta.fields + ["comments", "updated_at"]


class IdeaCreateSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=200)
    body = serializers.CharField()
    category = serializers.ChoiceField(choices=Idea.Category.choices)
