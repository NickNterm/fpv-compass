from django.conf import settings
from django.db import models


class Post(models.Model):
    title = models.CharField(max_length=200)
    body = models.TextField(help_text="Markdown source")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="posts",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title

    @property
    def computed_vote_count(self):
        return self.votes.aggregate(total=models.Sum("value"))["total"] or 0


class PostVote(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="post_votes",
    )
    post = models.ForeignKey(
        Post, on_delete=models.CASCADE, related_name="votes"
    )
    value = models.SmallIntegerField(choices=[(1, "Upvote"), (-1, "Downvote")])

    class Meta:
        unique_together = ("user", "post")

    def __str__(self):
        direction = "up" if self.value == 1 else "down"
        return f"{self.user.username} {direction}voted: {self.post.title}"
