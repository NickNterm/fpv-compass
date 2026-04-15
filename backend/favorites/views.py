from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from tricks.models import Trick

from .models import Favorite
from .serializers import FavoriteSerializer


class FavoriteListView(generics.ListAPIView):
    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user).select_related("trick")


class FavoriteToggleView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, slug):
        trick = Trick.objects.filter(slug=slug).first()
        if not trick:
            return Response(
                {"detail": "Trick not found."}, status=status.HTTP_404_NOT_FOUND
            )
        favorite, created = Favorite.objects.get_or_create(
            user=request.user, trick=trick
        )
        return Response(
            FavoriteSerializer(favorite).data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )

    def delete(self, request, slug):
        deleted, _ = Favorite.objects.filter(
            user=request.user, trick__slug=slug
        ).delete()
        if deleted:
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response(
            {"detail": "Not favorited."}, status=status.HTTP_404_NOT_FOUND
        )
