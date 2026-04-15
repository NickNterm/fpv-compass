from django.urls import path

from . import views

urlpatterns = [
    path("favorites/", views.FavoriteListView.as_view(), name="favorite-list"),
    path(
        "tricks/<slug:slug>/favorite/",
        views.FavoriteToggleView.as_view(),
        name="favorite-toggle",
    ),
]
