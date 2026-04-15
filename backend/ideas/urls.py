from django.urls import path

from . import views

urlpatterns = [
    path("ideas/", views.IdeaListView.as_view(), name="idea-list"),
    path("ideas/create/", views.IdeaCreateView.as_view(), name="idea-create"),
    path("ideas/<int:pk>/", views.IdeaDetailView.as_view(), name="idea-detail"),
    path("ideas/<int:pk>/vote/", views.IdeaVoteView.as_view(), name="idea-vote"),
    path(
        "ideas/<int:pk>/comments/",
        views.IdeaCommentView.as_view(),
        name="idea-comment",
    ),
]
