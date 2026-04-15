from django.db.models import Count, Sum, Value
from django.db.models.functions import Coalesce
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Idea, IdeaComment, IdeaVote
from .serializers import (
    IdeaCreateSerializer,
    IdeaDetailSerializer,
    IdeaListSerializer,
)


class IdeaListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        sort = request.query_params.get("sort", "votes")
        category = request.query_params.get("category")
        status_filter = request.query_params.get("status")

        ideas = Idea.objects.select_related("user__profile").annotate(
            vote_count=Coalesce(Sum("votes__value"), Value(0)),
            comment_count=Count("comments"),
        )

        if category:
            ideas = ideas.filter(category=category)
        if status_filter:
            ideas = ideas.filter(status=status_filter)

        if sort == "newest":
            ideas = ideas.order_by("-created_at")
        else:
            ideas = ideas.order_by("-vote_count", "-created_at")

        serializer = IdeaListSerializer(
            ideas, many=True, context={"request": request}
        )
        return Response(serializer.data)


class IdeaCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = IdeaCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        idea = Idea.objects.create(
            user=request.user, **serializer.validated_data
        )
        # Auto-upvote by author
        IdeaVote.objects.create(user=request.user, idea=idea, value=1)

        detail = (
            Idea.objects.filter(pk=idea.pk)
            .annotate(
                vote_count=Coalesce(Sum("votes__value"), Value(0)),
                comment_count=Count("comments"),
            )
            .first()
        )
        return Response(
            IdeaDetailSerializer(detail, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )


class IdeaDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        idea = (
            Idea.objects.filter(pk=pk)
            .select_related("user__profile")
            .prefetch_related("comments__user__profile", "votes")
            .annotate(
                vote_count=Coalesce(Sum("votes__value"), Value(0)),
                comment_count=Count("comments"),
            )
            .first()
        )
        if not idea:
            return Response(
                {"detail": "Idea not found."}, status=status.HTTP_404_NOT_FOUND
            )
        return Response(
            IdeaDetailSerializer(idea, context={"request": request}).data
        )


class IdeaVoteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        idea = Idea.objects.filter(pk=pk).first()
        if not idea:
            return Response(
                {"detail": "Idea not found."}, status=status.HTTP_404_NOT_FOUND
            )

        value = request.data.get("value")
        if value not in (1, -1):
            return Response(
                {"detail": "Value must be 1 or -1."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        vote, _ = IdeaVote.objects.update_or_create(
            user=request.user, idea=idea, defaults={"value": value}
        )

        new_score = idea.votes.aggregate(total=Sum("value"))["total"] or 0
        return Response({"vote_count": new_score, "user_vote": vote.value})


class IdeaCommentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        idea = Idea.objects.filter(pk=pk).first()
        if not idea:
            return Response(
                {"detail": "Idea not found."}, status=status.HTTP_404_NOT_FOUND
            )

        body = request.data.get("body", "").strip()
        if not body:
            return Response(
                {"detail": "Body is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        comment = IdeaComment.objects.create(
            idea=idea, user=request.user, body=body
        )

        from .serializers import IdeaCommentSerializer

        return Response(
            IdeaCommentSerializer(comment).data,
            status=status.HTTP_201_CREATED,
        )
