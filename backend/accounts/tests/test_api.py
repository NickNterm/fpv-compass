from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework.test import APIClient


class AuthAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_register(self):
        response = self.client.post(
            "/api/auth/register/",
            {
                "email": "new@test.com",
                "password": "testpass123",
                "display_name": "NewPilot",
            },
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        data = response.json()
        self.assertEqual(data["email"], "new@test.com")
        self.assertEqual(data["display_name"], "NewPilot")

    def test_register_duplicate_email(self):
        User.objects.create_user("dup@test.com", "dup@test.com", "pass1234")
        response = self.client.post(
            "/api/auth/register/",
            {
                "email": "dup@test.com",
                "password": "testpass123",
                "display_name": "Dup",
            },
            format="json",
        )
        self.assertEqual(response.status_code, 400)

    def test_login(self):
        User.objects.create_user("login@test.com", "login@test.com", "pass1234")
        response = self.client.post(
            "/api/auth/login/",
            {"email": "login@test.com", "password": "pass1234"},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["email"], "login@test.com")

    def test_login_wrong_password(self):
        User.objects.create_user("user@test.com", "user@test.com", "pass1234")
        response = self.client.post(
            "/api/auth/login/",
            {"email": "user@test.com", "password": "wrongpass"},
            format="json",
        )
        self.assertEqual(response.status_code, 400)

    def test_me_authenticated(self):
        user = User.objects.create_user("me@test.com", "me@test.com", "pass1234")
        self.client.force_authenticate(user=user)
        response = self.client.get("/api/auth/me/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["email"], "me@test.com")

    def test_me_unauthenticated(self):
        response = self.client.get("/api/auth/me/")
        self.assertEqual(response.status_code, 403)

    def test_logout(self):
        user = User.objects.create_user("out@test.com", "out@test.com", "pass1234")
        self.client.force_authenticate(user=user)
        response = self.client.post("/api/auth/logout/")
        self.assertEqual(response.status_code, 200)
