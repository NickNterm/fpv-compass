from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from tricks.models import Trick

from .models import UserProgress
from .serializers import UserProgressSerializer


class ProgressListView(generics.ListAPIView):
    serializer_class = UserProgressSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        return (
            UserProgress.objects.filter(user=self.request.user)
            .select_related("trick")
        )


class ProgressToggleView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, slug):
        trick = Trick.objects.filter(slug=slug).first()
        if not trick:
            return Response(
                {"detail": "Trick not found."}, status=status.HTTP_404_NOT_FOUND
            )
        progress, created = UserProgress.objects.get_or_create(
            user=request.user, trick=trick
        )
        return Response(
            UserProgressSerializer(progress).data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )

    def delete(self, request, slug):
        deleted, _ = UserProgress.objects.filter(
            user=request.user, trick__slug=slug
        ).delete()
        if deleted:
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response(
            {"detail": "Not marked as learned."}, status=status.HTTP_404_NOT_FOUND
        )
