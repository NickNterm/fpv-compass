from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.utils.text import slugify


class Phase(models.Model):
    name = models.CharField(max_length=100)
    order = models.PositiveIntegerField(unique=True)
    description = models.TextField(blank=True)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return self.name


class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=50, unique=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Trick(models.Model):
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True)
    description = models.TextField()
    difficulty = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(10)]
    )
    pro_tip = models.TextField(blank=True)
    phase = models.ForeignKey(
        Phase, on_delete=models.CASCADE, related_name="tricks"
    )
    prerequisites = models.ManyToManyField(
        "self", symmetrical=False, blank=True, related_name="unlocks"
    )
    tags = models.ManyToManyField(Tag, blank=True, related_name="tricks")
    demo_gif_url = models.URLField(blank=True, default="")
    is_community = models.BooleanField(default=False)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="submitted_tricks",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["difficulty", "name"]

    def __str__(self):
        return f"{self.name} (Difficulty: {self.difficulty})"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Video(models.Model):
    trick = models.ForeignKey(
        Trick, on_delete=models.CASCADE, related_name="videos"
    )
    youtube_url = models.URLField()
    title = models.CharField(max_length=300)
    channel_name = models.CharField(max_length=200)
    duration_seconds = models.PositiveIntegerField()
    timestamp_seconds = models.PositiveIntegerField(null=True, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"{self.title} ({self.channel_name})"
