from django.contrib import admin

from .models import Idea, IdeaComment, IdeaVote


class IdeaCommentInline(admin.TabularInline):
    model = IdeaComment
    extra = 0
    readonly_fields = ("user", "created_at")


@admin.register(Idea)
class IdeaAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "status", "user", "vote_score", "created_at")
    list_filter = ("category", "status")
    search_fields = ("title", "body")
    inlines = [IdeaCommentInline]

    @admin.display(description="Votes")
    def vote_score(self, obj):
        return obj.computed_vote_count


@admin.register(IdeaVote)
class IdeaVoteAdmin(admin.ModelAdmin):
    list_display = ("user", "idea", "value")


@admin.register(IdeaComment)
class IdeaCommentAdmin(admin.ModelAdmin):
    list_display = ("user", "idea", "body_preview", "created_at")

    @admin.display(description="Body")
    def body_preview(self, obj):
        return obj.body[:80]
