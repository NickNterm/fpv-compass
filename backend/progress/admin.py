from django.contrib import admin

from .models import UserProgress


@admin.register(UserProgress)
class UserProgressAdmin(admin.ModelAdmin):
    list_display = ("user", "trick", "learned_at")
    list_filter = ("learned_at",)
    search_fields = ("user__username", "trick__name")
