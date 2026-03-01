from django.urls import path
from . import views

urlpatterns = [
    path("", views.place_list_view, name="posts_index"),
    path("places/", views.place_list_view, name="place_list"),
    path("places/search/", views.place_search_api, name="place_search_api"),
    path("places/<slug:slug>/", views.place_detail_view, name="place_detail"),
    path("<int:pk>/", views.post_detail_view, name="post_detail"),
    path("new/", views.post_create_view, name="post_create"),
    path("<int:pk>/edit/", views.post_edit_view, name="post_edit"),
    path("<int:pk>/delete/", views.post_delete_view, name="post_delete"),
    path("<int:pk>/like/", views.like_toggle_view, name="like_toggle"),
    path("<int:pk>/bookmark/", views.bookmark_toggle_view, name="bookmark_toggle"),
    path("me/", views.my_posts_view, name="my_posts"),
    path("me/saved/", views.saved_posts_view, name="saved_posts"),
]
