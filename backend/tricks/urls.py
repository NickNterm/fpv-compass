from django.urls import path

from . import views

urlpatterns = [
    path("phases/", views.PhaseListView.as_view(), name="phase-list"),
    path("tricks/", views.TrickListView.as_view(), name="trick-list"),
    path("tricks/<slug:slug>/", views.TrickDetailView.as_view(), name="trick-detail"),
    path("community/submit/", views.CommunitySubmitView.as_view(), name="community-submit"),
]
