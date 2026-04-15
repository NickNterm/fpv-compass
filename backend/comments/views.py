from django.db.models import Sum, Value
from django.db.models.functions import Coalesce
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from tricks.models import Trick

from .models import Comment, CommentVote
from .serializers import CommentCreateSerializer, CommentSerializer, CommentVoteSerializer


class CommentListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, slug):
        trick = Trick.objects.filter(slug=slug).first()
        if not trick:
            return Response(
                {"detail": "Trick not found."}, status=status.HTTP_404_NOT_FOUND
            )

        sort = request.query_params.get("sort", "score")
        comments = (
            Comment.objects.filter(trick=trick, parent__isnull=True)
            .select_related("user__profile")
            .prefetch_related("replies__user__profile", "replies__votes", "votes")
            .annotate(annotated_score=Coalesce(Sum("votes__value"), Value(0)))
        )

        if sort == "newest":
            comments = comments.order_by("-created_at")
        else:
            comments = comments.order_by("-annotated_score", "-created_at")

        serializer = CommentSerializer(
            comments, many=True, context={"request": request}
        )
        return Response(serializer.data)


class CommentCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, slug):
        trick = Trick.objects.filter(slug=slug).first()
        if not trick:
            return Response(
                {"detail": "Trick not found."}, status=status.HTTP_404_NOT_FOUND
            )

        serializer = CommentCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        parent_id = serializer.validated_data.get("parent")
        parent = Comment.objects.get(id=parent_id) if parent_id else None

        comment = Comment.objects.create(
            trick=trick,
            user=request.user,
            parent=parent,
            body=serializer.validated_data["body"],
        )

        return Response(
            CommentSerializer(comment, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )


class CommentUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        comment = Comment.objects.filter(pk=pk, user=request.user).first()
        if not comment:
            return Response(
                {"detail": "Comment not found or not yours."},
                status=status.HTTP_404_NOT_FOUND,
            )

        body = request.data.get("body")
        if not body:
            return Response(
                {"detail": "Body is required."}, status=status.HTTP_400_BAD_REQUEST
            )

        comment.body = body
        comment.save(update_fields=["body", "updated_at"])
        return Response(
            CommentSerializer(comment, context={"request": request}).data
        )

    def delete(self, request, pk):
        comment = Comment.objects.filter(pk=pk, user=request.user).first()
        if not comment:
            return Response(
                {"detail": "Comment not found or not yours."},
                status=status.HTTP_404_NOT_FOUND,
            )
        comment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class CommentVoteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        comment = Comment.objects.filter(pk=pk).first()
        if not comment:
            return Response(
                {"detail": "Comment not found."}, status=status.HTTP_404_NOT_FOUND
            )

        serializer = CommentVoteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        vote, created = CommentVote.objects.update_or_create(
            user=request.user,
            comment=comment,
            defaults={"value": serializer.validated_data["value"]},
        )

        new_score = comment.votes.aggregate(total=Sum("value"))["total"] or 0
        return Response({"score": new_score, "user_vote": vote.value})
