from django.db.models import Sum
from rest_framework import serializers

from .models import Comment, CommentVote


class CommentSerializer(serializers.ModelSerializer):
    author = serializers.SerializerMethodField()
    score = serializers.SerializerMethodField()
    user_vote = serializers.SerializerMethodField()
    replies = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = [
            "id",
            "author",
            "body",
            "parent",
            "score",
            "user_vote",
            "replies",
            "created_at",
            "updated_at",
        ]

    def get_author(self, obj):
        if hasattr(obj.user, "profile"):
            return obj.user.profile.display_name
        return obj.user.username

    def get_score(self, obj):
        if hasattr(obj, "annotated_score"):
            return obj.annotated_score or 0
        return obj.votes.aggregate(total=Sum("value"))["total"] or 0

    def get_user_vote(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return None
        vote = obj.votes.filter(user=request.user).first()
        return vote.value if vote else None

    def get_replies(self, obj):
        if obj.parent is not None:
            return []
        replies = obj.replies.select_related("user__profile").prefetch_related("votes")
        return CommentSerializer(
            replies, many=True, context=self.context
        ).data


class CommentCreateSerializer(serializers.Serializer):
    body = serializers.CharField()
    parent = serializers.IntegerField(required=False, allow_null=True)

    def validate_parent(self, value):
        if value is not None:
            parent = Comment.objects.filter(id=value).first()
            if not parent:
                raise serializers.ValidationError("Parent comment does not exist.")
            if parent.parent is not None:
                raise serializers.ValidationError(
                    "Cannot reply to a reply. Max nesting depth is 2."
                )
        return value


class CommentVoteSerializer(serializers.Serializer):
    value = serializers.ChoiceField(choices=[1, -1])
