import pytest
from django.urls import reverse
from django.contrib.auth import get_user_model
from posts.models import Place

User = get_user_model()


@pytest.mark.django_db
def test_home_page_loads(client):
    resp = client.get(reverse("home"))
    assert resp.status_code == 200


@pytest.mark.django_db
def test_create_post_requires_login(client):
    resp = client.get(reverse("post_create"))
    assert resp.status_code in (302, 401)


@pytest.mark.django_db
def test_logged_in_user_can_create_post(client):
    client.login(username="u1@example.com", password="pass12345")
    place = Place.objects.create(name="Registan Square")

    resp = client.post(
        reverse("post_create"),
        {
            "place": place.id,
            "title": "Test Title",
            "content": "Test Content",
            "rating": 5,
        },
    )
    assert resp.status_code in (200, 302)
