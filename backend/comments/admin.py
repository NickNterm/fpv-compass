from django.contrib import admin

from .models import Comment, CommentVote


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ("user", "trick", "parent", "body_preview", "created_at")
    list_filter = ("trick", "created_at")
    search_fields = ("body", "user__username")

    @admin.display(description="Body")
    def body_preview(self, obj):
        return obj.body[:80] + "..." if len(obj.body) > 80 else obj.body


@admin.register(CommentVote)
class CommentVoteAdmin(admin.ModelAdmin):
    list_display = ("user", "comment", "value")
    list_filter = ("value",)
