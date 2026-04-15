from django.conf import settings
from django.db import models


class Favorite(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="favorites",
    )
    trick = models.ForeignKey(
        "tricks.Trick",
        on_delete=models.CASCADE,
        related_name="favorited_by",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "trick")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.username} favorited {self.trick.name}"
