from django.db.models import Sum, Value
from django.db.models.functions import Coalesce
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Post, PostVote
from .serializers import (
    PostCreateSerializer,
    PostDetailSerializer,
    PostListSerializer,
)


class PostListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        sort = request.query_params.get("sort", "votes")

        posts = Post.objects.select_related("user__profile").annotate(
            vote_count=Coalesce(Sum("votes__value"), Value(0)),
        )

        if sort == "newest":
            posts = posts.order_by("-created_at")
        else:
            posts = posts.order_by("-vote_count", "-created_at")

        serializer = PostListSerializer(
            posts, many=True, context={"request": request}
        )
        return Response(serializer.data)


class PostCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = PostCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        post = Post.objects.create(
            user=request.user, **serializer.validated_data
        )
        # Auto-upvote by author
        PostVote.objects.create(user=request.user, post=post, value=1)

        detail = (
            Post.objects.filter(pk=post.pk)
            .annotate(vote_count=Coalesce(Sum("votes__value"), Value(0)))
            .first()
        )
        return Response(
            PostDetailSerializer(detail, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )


class PostDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        post = (
            Post.objects.filter(pk=pk)
            .select_related("user__profile")
            .prefetch_related("votes")
            .annotate(vote_count=Coalesce(Sum("votes__value"), Value(0)))
            .first()
        )
        if not post:
            return Response(
                {"detail": "Post not found."}, status=status.HTTP_404_NOT_FOUND
            )
        return Response(
            PostDetailSerializer(post, context={"request": request}).data
        )


class PostVoteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        post = Post.objects.filter(pk=pk).first()
        if not post:
            return Response(
                {"detail": "Post not found."}, status=status.HTTP_404_NOT_FOUND
            )

        value = request.data.get("value")
        if value not in (1, -1):
            return Response(
                {"detail": "Value must be 1 or -1."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        vote, _ = PostVote.objects.update_or_create(
            user=request.user, post=post, defaults={"value": value}
        )

        new_score = post.votes.aggregate(total=Sum("value"))["total"] or 0
        return Response({"vote_count": new_score, "user_vote": vote.value})
