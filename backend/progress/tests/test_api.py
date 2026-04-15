from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework.test import APIClient

from progress.models import UserProgress
from tricks.models import Phase, Trick


class ProgressAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user("test@test.com", "test@test.com", "pass1234")
        self.phase = Phase.objects.create(name="Foundations", order=1)
        self.trick = Trick.objects.create(
            name="Hover Control",
            slug="hover-control",
            description="Hold position",
            difficulty=1,
            phase=self.phase,
        )
        self.client.force_authenticate(user=self.user)

    def test_mark_learned(self):
        response = self.client.post("/api/tricks/hover-control/progress/")
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()["trick_slug"], "hover-control")

    def test_mark_learned_idempotent(self):
        self.client.post("/api/tricks/hover-control/progress/")
        response = self.client.post("/api/tricks/hover-control/progress/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(UserProgress.objects.count(), 1)

    def test_unmark_learned(self):
        self.client.post("/api/tricks/hover-control/progress/")
        response = self.client.delete("/api/tricks/hover-control/progress/")
        self.assertEqual(response.status_code, 204)
        self.assertEqual(UserProgress.objects.count(), 0)

    def test_unmark_not_learned(self):
        response = self.client.delete("/api/tricks/hover-control/progress/")
        self.assertEqual(response.status_code, 404)

    def test_progress_list(self):
        self.client.post("/api/tricks/hover-control/progress/")
        response = self.client.get("/api/progress/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 1)

    def test_progress_requires_auth(self):
        self.client.force_authenticate(user=None)
        response = self.client.get("/api/progress/")
        self.assertEqual(response.status_code, 403)

    def test_mark_nonexistent_trick(self):
        response = self.client.post("/api/tricks/nonexistent/progress/")
        self.assertEqual(response.status_code, 404)
