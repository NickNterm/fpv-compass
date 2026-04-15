from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework.test import APIClient

from comments.models import Comment, CommentVote
from tricks.models import Phase, Trick


class CommentAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user("test@test.com", "test@test.com", "pass1234")
        self.user2 = User.objects.create_user("other@test.com", "other@test.com", "pass1234")
        self.phase = Phase.objects.create(name="Foundations", order=1)
        self.trick = Trick.objects.create(
            name="Hover Control",
            slug="hover-control",
            description="Hold position",
            difficulty=1,
            phase=self.phase,
        )

    def test_list_comments_empty(self):
        response = self.client.get("/api/tricks/hover-control/comments/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 0)

    def test_create_comment(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post(
            "/api/tricks/hover-control/comments/create/",
            {"body": "Great trick!"},
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()["body"], "Great trick!")
        self.assertEqual(response.json()["author"], "test@test.com")

    def test_create_comment_requires_auth(self):
        response = self.client.post(
            "/api/tricks/hover-control/comments/create/",
            {"body": "Test"},
            format="json",
        )
        self.assertEqual(response.status_code, 403)

    def test_reply_to_comment(self):
        self.client.force_authenticate(user=self.user)
        parent = self.client.post(
            "/api/tricks/hover-control/comments/create/",
            {"body": "Parent"},
            format="json",
        ).json()

        response = self.client.post(
            "/api/tricks/hover-control/comments/create/",
            {"body": "Reply", "parent": parent["id"]},
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()["parent"], parent["id"])

    def test_cannot_reply_to_reply(self):
        self.client.force_authenticate(user=self.user)
        parent = self.client.post(
            "/api/tricks/hover-control/comments/create/",
            {"body": "Parent"},
            format="json",
        ).json()
        reply = self.client.post(
            "/api/tricks/hover-control/comments/create/",
            {"body": "Reply", "parent": parent["id"]},
            format="json",
        ).json()

        response = self.client.post(
            "/api/tricks/hover-control/comments/create/",
            {"body": "Deep reply", "parent": reply["id"]},
            format="json",
        )
        self.assertEqual(response.status_code, 400)

    def test_edit_own_comment(self):
        self.client.force_authenticate(user=self.user)
        comment = self.client.post(
            "/api/tricks/hover-control/comments/create/",
            {"body": "Original"},
            format="json",
        ).json()

        response = self.client.patch(
            f"/api/comments/{comment['id']}/",
            {"body": "Edited"},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["body"], "Edited")

    def test_cannot_edit_others_comment(self):
        self.client.force_authenticate(user=self.user)
        comment = self.client.post(
            "/api/tricks/hover-control/comments/create/",
            {"body": "Original"},
            format="json",
        ).json()

        self.client.force_authenticate(user=self.user2)
        response = self.client.patch(
            f"/api/comments/{comment['id']}/",
            {"body": "Hacked"},
            format="json",
        )
        self.assertEqual(response.status_code, 404)

    def test_delete_own_comment(self):
        self.client.force_authenticate(user=self.user)
        comment = self.client.post(
            "/api/tricks/hover-control/comments/create/",
            {"body": "Delete me"},
            format="json",
        ).json()

        response = self.client.delete(f"/api/comments/{comment['id']}/")
        self.assertEqual(response.status_code, 204)
        self.assertEqual(Comment.objects.count(), 0)

    def test_upvote(self):
        self.client.force_authenticate(user=self.user)
        comment = self.client.post(
            "/api/tricks/hover-control/comments/create/",
            {"body": "Vote me"},
            format="json",
        ).json()

        response = self.client.post(
            f"/api/comments/{comment['id']}/vote/",
            {"value": 1},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["score"], 1)
        self.assertEqual(response.json()["user_vote"], 1)

    def test_change_vote(self):
        self.client.force_authenticate(user=self.user)
        comment = self.client.post(
            "/api/tricks/hover-control/comments/create/",
            {"body": "Vote me"},
            format="json",
        ).json()

        self.client.post(
            f"/api/comments/{comment['id']}/vote/",
            {"value": 1},
            format="json",
        )
        response = self.client.post(
            f"/api/comments/{comment['id']}/vote/",
            {"value": -1},
            format="json",
        )
        self.assertEqual(response.json()["score"], -1)
        self.assertEqual(CommentVote.objects.count(), 1)

    def test_comments_sorted_by_score(self):
        self.client.force_authenticate(user=self.user)
        c1 = self.client.post(
            "/api/tricks/hover-control/comments/create/",
            {"body": "Low score"},
            format="json",
        ).json()
        c2 = self.client.post(
            "/api/tricks/hover-control/comments/create/",
            {"body": "High score"},
            format="json",
        ).json()

        # Upvote c2
        self.client.post(f"/api/comments/{c2['id']}/vote/", {"value": 1}, format="json")

        response = self.client.get("/api/tricks/hover-control/comments/?sort=score")
        data = response.json()
        self.assertEqual(data[0]["body"], "High score")
