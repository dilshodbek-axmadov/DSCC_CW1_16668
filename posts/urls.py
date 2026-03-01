from django.urls import path
from . import views

urlpatterns = [
    path("places/", views.place_list_view, name="place_list"),
    path("create/", views.post_create_view, name="post_create"),
    path("my/", views.my_posts_view, name="my_posts"),
]
