from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Post, PostVote

User = get_user_model()


class BlogPostTests(APITestCase):
    def setUp(self):
        self.author = User.objects.create_user(
            username="author", password="pass12345"
        )
        self.voter = User.objects.create_user(
            username="voter", password="pass12345"
        )

    def test_create_requires_auth(self):
        res = self.client.post(
            reverse("post-create"),
            {"title": "Hi", "body": "# hello"},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(Post.objects.count(), 0)

    def test_create_auto_upvotes_author(self):
        self.client.force_authenticate(self.author)
        res = self.client.post(
            reverse("post-create"),
            {"title": "My first trick", "body": "**bold** body"},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data["vote_count"], 1)
        post = Post.objects.get()
        self.assertEqual(post.user, self.author)
        self.assertEqual(post.computed_vote_count, 1)

    def test_vote_toggle_and_update(self):
        post = Post.objects.create(
            user=self.author, title="t", body="b"
        )
        self.client.force_authenticate(self.voter)
        url = reverse("post-vote", args=[post.pk])

        res = self.client.post(url, {"value": 1}, format="json")
        self.assertEqual(res.data["vote_count"], 1)

        # Same user changes vote -> updates, not duplicates
        res = self.client.post(url, {"value": -1}, format="json")
        self.assertEqual(res.data["vote_count"], -1)
        self.assertEqual(PostVote.objects.filter(post=post).count(), 1)

    def test_invalid_vote_value(self):
        post = Post.objects.create(user=self.author, title="t", body="b")
        self.client.force_authenticate(self.voter)
        res = self.client.post(
            reverse("post-vote", args=[post.pk]),
            {"value": 5},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_list_sort_votes_vs_newest(self):
        old = Post.objects.create(user=self.author, title="old", body="b")
        PostVote.objects.create(user=self.author, post=old, value=1)
        PostVote.objects.create(user=self.voter, post=old, value=1)
        new = Post.objects.create(user=self.author, title="new", body="b")

        votes = self.client.get(reverse("post-list"), {"sort": "votes"})
        self.assertEqual(votes.data[0]["title"], "old")

        newest = self.client.get(reverse("post-list"), {"sort": "newest"})
        self.assertEqual(newest.data[0]["title"], "new")
