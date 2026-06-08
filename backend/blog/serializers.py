from rest_framework import serializers

from .models import Post


class PostListSerializer(serializers.ModelSerializer):
    author = serializers.SerializerMethodField()
    vote_count = serializers.IntegerField(read_only=True)
    user_vote = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            "id",
            "title",
            "body",
            "author",
            "vote_count",
            "user_vote",
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


class PostDetailSerializer(PostListSerializer):
    class Meta(PostListSerializer.Meta):
        fields = PostListSerializer.Meta.fields + ["updated_at"]


class PostCreateSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=200)
    body = serializers.CharField()
