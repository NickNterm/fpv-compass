from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path


def health_check(request):
    return JsonResponse({"status": "ok"})


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/", health_check),
    path("api/", include("tricks.urls")),
    path("api/", include("accounts.urls")),
    path("api/", include("progress.urls")),
    path("api/", include("favorites.urls")),
    path("api/", include("comments.urls")),
    path("api/", include("ideas.urls")),
]
