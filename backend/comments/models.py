from django.conf import settings
from django.db import models


class Comment(models.Model):
    trick = models.ForeignKey(
        "tricks.Trick",
        on_delete=models.CASCADE,
        related_name="comments",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="comments",
    )
    parent = models.ForeignKey(
        "self",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="replies",
    )
    body = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.username} on {self.trick.name}: {self.body[:50]}"

    @property
    def score(self):
        return self.votes.aggregate(total=models.Sum("value"))["total"] or 0


class CommentVote(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="comment_votes",
    )
    comment = models.ForeignKey(
        Comment,
        on_delete=models.CASCADE,
        related_name="votes",
    )
    value = models.SmallIntegerField(
        choices=[(1, "Upvote"), (-1, "Downvote")]
    )

    class Meta:
        unique_together = ("user", "comment")

    def __str__(self):
        direction = "up" if self.value == 1 else "down"
        return f"{self.user.username} {direction}voted comment #{self.comment_id}"
