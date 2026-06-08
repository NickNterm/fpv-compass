from django.urls import path

from . import views

urlpatterns = [
    path("blog/posts/", views.PostListView.as_view(), name="post-list"),
    path(
        "blog/posts/create/",
        views.PostCreateView.as_view(),
        name="post-create",
    ),
    path(
        "blog/posts/<int:pk>/",
        views.PostDetailView.as_view(),
        name="post-detail",
    ),
    path(
        "blog/posts/<int:pk>/vote/",
        views.PostVoteView.as_view(),
        name="post-vote",
    ),
]
