from django.urls import path

from . import views

urlpatterns = [
    path(
        "tricks/<slug:slug>/comments/",
        views.CommentListView.as_view(),
        name="comment-list",
    ),
    path(
        "tricks/<slug:slug>/comments/create/",
        views.CommentCreateView.as_view(),
        name="comment-create",
    ),
    path(
        "comments/<int:pk>/",
        views.CommentUpdateView.as_view(),
        name="comment-update",
    ),
    path(
        "comments/<int:pk>/vote/",
        views.CommentVoteView.as_view(),
        name="comment-vote",
    ),
]
