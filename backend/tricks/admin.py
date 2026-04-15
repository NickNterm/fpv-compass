from django.contrib import admin

from .models import Phase, Tag, Trick, Video


class VideoInline(admin.TabularInline):
    model = Video
    extra = 1


@admin.register(Phase)
class PhaseAdmin(admin.ModelAdmin):
    list_display = ("name", "order", "trick_count")
    ordering = ("order",)

    @admin.display(description="Tricks")
    def trick_count(self, obj):
        return obj.tricks.count()


@admin.register(Trick)
class TrickAdmin(admin.ModelAdmin):
    list_display = ("name", "phase", "difficulty", "is_community", "video_count")
    list_filter = ("phase", "is_community", "difficulty")
    search_fields = ("name", "description")
    prepopulated_fields = {"slug": ("name",)}
    filter_horizontal = ("prerequisites", "tags")
    inlines = [VideoInline]

    @admin.display(description="Videos")
    def video_count(self, obj):
        return obj.videos.count()


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    list_display = ("title", "trick", "channel_name", "duration_seconds")
    list_filter = ("channel_name",)
    search_fields = ("title",)
