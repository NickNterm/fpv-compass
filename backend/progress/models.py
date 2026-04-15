from django.conf import settings
from django.db import models


class UserProgress(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="progress",
    )
    trick = models.ForeignKey(
        "tricks.Trick",
        on_delete=models.CASCADE,
        related_name="learned_by",
    )
    learned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "trick")
        ordering = ["-learned_at"]

    def __str__(self):
        return f"{self.user.username} learned {self.trick.name}"
