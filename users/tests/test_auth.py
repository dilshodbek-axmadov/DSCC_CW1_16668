import pytest
from django.urls import reverse
from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.mark.django_db
def test_register_page_loads(client):
    resp = client.get(reverse("register"))
    assert resp.status_code == 200


@pytest.mark.django_db
def test_user_can_register(client):
    resp = client.post(reverse("register"), {
        "email": "test@example.com",
        "first_name": "Test",
        "last_name": "User",
        "password1": "StrongPass123!",
        "password2": "StrongPass123!",
    })
    assert resp.status_code in (200, 302)
    assert User.objects.filter(email="test@example.com").exists()
