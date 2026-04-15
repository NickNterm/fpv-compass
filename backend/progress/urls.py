from django.urls import path

from . import views

urlpatterns = [
    path("progress/", views.ProgressListView.as_view(), name="progress-list"),
    path(
        "tricks/<slug:slug>/progress/",
        views.ProgressToggleView.as_view(),
        name="progress-toggle",
    ),
]
