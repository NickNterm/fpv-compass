from django.contrib import admin

from .models import Post, PostVote


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ("title", "user", "vote_score", "created_at")
    search_fields = ("title", "body")

    @admin.display(description="Votes")
    def vote_score(self, obj):
        return obj.computed_vote_count


@admin.register(PostVote)
class PostVoteAdmin(admin.ModelAdmin):
    list_display = ("user", "post", "value")
