from django.conf import settings
from django.db import models


class Idea(models.Model):
    class Category(models.TextChoices):
        FEATURE = "feature", "Feature Request"
        IMPROVEMENT = "improvement", "Improvement"
        BUG = "bug", "Bug Report"
        OTHER = "other", "Other"

    class Status(models.TextChoices):
        OPEN = "open", "Open"
        PLANNED = "planned", "Planned"
        IN_PROGRESS = "in_progress", "In Progress"
        DONE = "done", "Done"
        DECLINED = "declined", "Declined"

    title = models.CharField(max_length=200)
    body = models.TextField()
    category = models.CharField(
        max_length=20, choices=Category.choices, default=Category.FEATURE
    )
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.OPEN
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="ideas",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} ({self.get_status_display()})"

    @property
    def computed_vote_count(self):
        return self.votes.aggregate(total=models.Sum("value"))["total"] or 0


class IdeaVote(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="idea_votes",
    )
    idea = models.ForeignKey(
        Idea, on_delete=models.CASCADE, related_name="votes"
    )
    value = models.SmallIntegerField(choices=[(1, "Upvote"), (-1, "Downvote")])

    class Meta:
        unique_together = ("user", "idea")

    def __str__(self):
        direction = "up" if self.value == 1 else "down"
        return f"{self.user.username} {direction}voted: {self.idea.title}"


class IdeaComment(models.Model):
    idea = models.ForeignKey(
        Idea, on_delete=models.CASCADE, related_name="comments"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="idea_comments",
    )
    body = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.user.username} on '{self.idea.title}': {self.body[:50]}"
