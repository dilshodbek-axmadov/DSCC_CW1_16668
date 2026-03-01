from django.contrib import admin
from .models import Place, Post, Comment, Like, Bookmark


@admin.register(Place)
class PlaceAdmin(admin.ModelAdmin):
    list_display = ("name", "country", "created_by", "created_at")
    search_fields = ("name",)
    list_filter = ("country",)
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ("author", "place", "rating", "title", "created_at")
    list_filter = ("rating", "place", "created_at")
    search_fields = ("title", "content")
    ordering = ("-created_at",)


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ("author", "post", "created_at")
    list_filter = ("created_at",)
    search_fields = ("text",)


@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    list_display = ("user", "post", "created_at")
    list_filter = ("created_at",)


@admin.register(Bookmark)
class BookmarkAdmin(admin.ModelAdmin):
    list_display = ("user", "post", "created_at")
    list_filter = ("created_at",)