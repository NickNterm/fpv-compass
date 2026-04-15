from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework.test import APIClient

from tricks.models import Phase, Trick, Video


class TrickAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.phase = Phase.objects.create(name="Foundations", order=1)
        self.phase2 = Phase.objects.create(name="Basic Tricks", order=2)
        self.trick1 = Trick.objects.create(
            name="Hover Control",
            slug="hover-control",
            description="Hold position",
            difficulty=1,
            phase=self.phase,
            pro_tip="Start in Acro",
        )
        self.trick2 = Trick.objects.create(
            name="Power Loop",
            slug="power-loop",
            description="Vertical loop",
            difficulty=4,
            phase=self.phase2,
        )
        self.trick2.prerequisites.add(self.trick1)
        Video.objects.create(
            trick=self.trick1,
            youtube_url="https://youtube.com/watch?v=abc",
            title="Hover Tutorial",
            channel_name="Bardwell",
            duration_seconds=600,
        )

    def test_phase_list(self):
        response = self.client.get("/api/phases/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 2)
        self.assertEqual(response.json()[0]["name"], "Foundations")
        self.assertEqual(len(response.json()[0]["tricks"]), 1)

    def test_trick_list(self):
        response = self.client.get("/api/tricks/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["count"], 2)
        self.assertEqual(data["results"][0]["name"], "Hover Control")

    def test_trick_list_search(self):
        response = self.client.get("/api/tricks/?search=power")
        data = response.json()
        self.assertEqual(data["count"], 1)
        self.assertEqual(data["results"][0]["name"], "Power Loop")

    def test_trick_list_filter_phase(self):
        response = self.client.get(f"/api/tricks/?phase={self.phase.id}")
        data = response.json()
        self.assertEqual(data["count"], 1)

    def test_trick_detail(self):
        response = self.client.get("/api/tricks/power-loop/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["name"], "Power Loop")
        self.assertEqual(len(data["prerequisites"]), 1)
        self.assertEqual(data["prerequisites"][0]["slug"], "hover-control")

    def test_trick_detail_not_found(self):
        response = self.client.get("/api/tricks/nonexistent/")
        self.assertEqual(response.status_code, 404)

    def test_trick_detail_videos(self):
        response = self.client.get("/api/tricks/hover-control/")
        data = response.json()
        self.assertEqual(len(data["videos"]), 1)
        self.assertEqual(data["videos"][0]["title"], "Hover Tutorial")

    def test_community_submit_requires_auth(self):
        response = self.client.post("/api/community/submit/", {})
        self.assertEqual(response.status_code, 403)

    def test_community_submit(self):
        user = User.objects.create_user("test@test.com", "test@test.com", "pass1234")
        self.client.force_authenticate(user=user)
        response = self.client.post(
            "/api/community/submit/",
            {
                "name": "New Trick",
                "description": "A cool trick",
                "difficulty": 5,
                "phase_id": self.phase.id,
                "video_urls": ["https://youtube.com/watch?v=xyz"],
            },
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        data = response.json()
        self.assertTrue(data["is_community"])
        self.assertEqual(data["name"], "New Trick")
