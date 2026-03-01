from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse
from django.db.models import Avg, Count, Q
from django.core.paginator import Paginator
from .models import Place, Post, Like, Bookmark
from .forms import PostForm, CommentForm


def _normalize_place_name(name):
    return " ".join((name or "").strip().split())


def _get_selected_place_name(form, instance=None):
    place_id = None
    if form.is_bound:
        place_id = form.data.get("place")
    elif instance and instance.place_id:
        place_id = instance.place_id

    if not place_id and hasattr(form, "cleaned_data"):
        cleaned_place = form.cleaned_data.get("place")
        if cleaned_place:
            return cleaned_place.name

    if not place_id:
        return ""

    try:
        return Place.objects.only("name").get(pk=place_id).name
    except (Place.DoesNotExist, ValueError, TypeError):
        return ""


def _resolve_or_create_place(form, user):
    place = form.cleaned_data.get("place")
    if place:
        return place

    raw_name = form.cleaned_data.get("new_place_name")
    raw_country = form.cleaned_data.get("new_place_country", "")
    name = _normalize_place_name(raw_name)
    country = (raw_country or "").strip()

    existing_place = Place.objects.filter(name__iexact=name).first()
    if existing_place:
        return existing_place

    return Place.objects.create(
        name=name,
        country=country,
        created_by=user,
    )


def home_view(request):
    top_places = (
        Place.objects.annotate(
            avg_rating=Avg("posts__rating"),
            post_count=Count("posts"),
        )
        .filter(post_count__gte=1)
        .order_by("-avg_rating", "-post_count")[:6]
    )
    recent_posts = Post.objects.select_related("author", "place").order_by("-created_at")[:6]
    return render(request, "posts/home.html", {
        "top_places": top_places,
        "recent_posts": recent_posts,
    })


def place_list_view(request):
    q = request.GET.get("q", "").strip()
    places = Place.objects.annotate(
        avg_rating=Avg("posts__rating"),
        post_count=Count("posts"),
    ).order_by("-post_count")

    if q:
        places = places.filter(Q(name__icontains=q) | Q(country__icontains=q))

    paginator = Paginator(places, 12)
    page_obj = paginator.get_page(request.GET.get("page"))
    return render(request, "posts/place_list.html", {"page_obj": page_obj, "query": q})


def place_detail_view(request, slug):
    place = get_object_or_404(
        Place.objects.annotate(avg_rating=Avg("posts__rating"), post_count=Count("posts")),
        slug=slug,
    )
    posts = Post.objects.filter(place=place).select_related("author").annotate(
        like_count=Count("likes")
    ).order_by("-created_at")
    paginator = Paginator(posts, 8)
    page_obj = paginator.get_page(request.GET.get("page"))
    return render(request, "posts/place_detail.html", {
        "place": place,
        "page_obj": page_obj,
    })


@login_required
def post_detail_view(request, pk):
    post = get_object_or_404(
        Post.objects.select_related("author", "place").annotate(like_count=Count("likes")),
        pk=pk,
    )
    comments = post.comments.select_related("author").order_by("created_at")
    is_liked = Like.objects.filter(user=request.user, post=post).exists()
    is_bookmarked = Bookmark.objects.filter(user=request.user, post=post).exists()
    comment_form = CommentForm()

    if request.method == "POST":
        comment_form = CommentForm(request.POST)
        if comment_form.is_valid():
            comment = comment_form.save(commit=False)
            comment.author = request.user
            comment.post = post
            comment.save()
            messages.success(request, "Comment added!")
            return redirect("post_detail", pk=post.pk)

    return render(request, "posts/post_detail.html", {
        "post": post,
        "comments": comments,
        "is_liked": is_liked,
        "is_bookmarked": is_bookmarked,
        "comment_form": comment_form,
    })


@login_required
def post_create_view(request):
    form = PostForm(request.POST or None, request.FILES or None)
    if request.method == "POST" and form.is_valid():
        place = _resolve_or_create_place(form, request.user)
        post = form.save(commit=False)
        post.author = request.user
        post.place = place
        post.save()
        messages.success(request, "Post created successfully!")
        return redirect("post_detail", pk=post.pk)
    return render(request, "posts/post_form.html", {
        "form": form,
        "action": "Create",
        "selected_place_name": _get_selected_place_name(form),
    })


@login_required
def post_edit_view(request, pk):
    post = get_object_or_404(Post, pk=pk, author=request.user)
    form = PostForm(request.POST or None, request.FILES or None, instance=post)
    if request.method == "POST" and form.is_valid():
        updated_post = form.save(commit=False)
        updated_post.place = _resolve_or_create_place(form, request.user)
        updated_post.save()
        messages.success(request, "Post updated successfully!")
        return redirect("post_detail", pk=post.pk)
    return render(request, "posts/post_form.html", {
        "form": form,
        "action": "Edit",
        "post": post,
        "selected_place_name": _get_selected_place_name(form, instance=post),
    })


@login_required
def post_delete_view(request, pk):
    post = get_object_or_404(Post, pk=pk, author=request.user)
    if request.method == "POST":
        post.delete()
        messages.success(request, "Post deleted.")
        return redirect("my_posts")
    return render(request, "posts/post_confirm_delete.html", {"post": post})


@login_required
def my_posts_view(request):
    posts = Post.objects.filter(author=request.user).annotate(
        like_count=Count("likes")
    ).order_by("-created_at")
    liked_posts = Post.objects.filter(likes__user=request.user).annotate(
        like_count=Count("likes")
    ).order_by("-created_at")
    paginator = Paginator(posts, 9)
    page_obj = paginator.get_page(request.GET.get("page"))
    return render(request, "posts/my_posts.html", {
        "page_obj": page_obj,
        "liked_posts": liked_posts,
    })


@login_required
def saved_posts_view(request):
    saved_posts = Post.objects.filter(bookmarks__user=request.user).annotate(
        like_count=Count("likes", distinct=True)
    ).order_by("-created_at")
    paginator = Paginator(saved_posts, 9)
    page_obj = paginator.get_page(request.GET.get("page"))
    return render(request, "posts/saved_posts.html", {"page_obj": page_obj})


@login_required
def like_toggle_view(request, pk):
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)
    post = get_object_or_404(Post, pk=pk)
    like, created = Like.objects.get_or_create(user=request.user, post=post)
    if not created:
        like.delete()
        liked = False
    else:
        liked = True
    return JsonResponse({"liked": liked, "count": post.likes.count()})


@login_required
def bookmark_toggle_view(request, pk):
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)
    post = get_object_or_404(Post, pk=pk)
    bookmark, created = Bookmark.objects.get_or_create(user=request.user, post=post)
    if not created:
        bookmark.delete()
        bookmarked = False
    else:
        bookmarked = True
    return JsonResponse({"bookmarked": bookmarked})


def place_search_api(request):
    q = request.GET.get("q", "").strip()
    limit_raw = request.GET.get("limit")
    try:
        limit = max(1, min(int(limit_raw), 15)) if limit_raw else (8 if q else 5)
    except ValueError:
        limit = 8 if q else 5

    qs = Place.objects.all().order_by("name")
    if q:
        qs = qs.filter(Q(name__icontains=q) | Q(country__icontains=q))
    places = [{"id": p.id, "name": p.name, "country": p.country} for p in qs[:limit]]
    return JsonResponse({"places": places})
