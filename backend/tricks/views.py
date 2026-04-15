from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, generics, permissions, status
from rest_framework.response import Response

from .models import Phase, Trick
from .serializers import (
    CommunityTrickSubmitSerializer,
    PhaseWithTricksSerializer,
    TrickDetailSerializer,
    TrickListSerializer,
)


class PhaseListView(generics.ListAPIView):
    serializer_class = PhaseWithTricksSerializer
    pagination_class = None

    def get_queryset(self):
        return Phase.objects.prefetch_related(
            "tricks", "tricks__prerequisites", "tricks__videos"
        ).all()


class TrickListView(generics.ListAPIView):
    serializer_class = TrickListSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["phase", "is_community"]
    search_fields = ["name", "description"]
    ordering_fields = ["difficulty", "name", "created_at"]
    ordering = ["difficulty"]

    def get_queryset(self):
        return (
            Trick.objects.select_related("phase")
            .prefetch_related("prerequisites", "tags", "videos")
            .all()
        )


class TrickDetailView(generics.RetrieveAPIView):
    serializer_class = TrickDetailSerializer
    lookup_field = "slug"

    def get_queryset(self):
        return (
            Trick.objects.select_related("phase", "created_by__profile")
            .prefetch_related("prerequisites", "tags", "videos")
            .all()
        )


class CommunitySubmitView(generics.CreateAPIView):
    serializer_class = CommunityTrickSubmitSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        trick = serializer.save()
        return Response(
            TrickDetailSerializer(trick).data,
            status=status.HTTP_201_CREATED,
        )
