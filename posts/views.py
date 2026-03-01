from django.contrib.auth.decorators import login_required
from django.http import HttpResponse
from django.shortcuts import render


def home_view(request):
    return render(request, "posts/home.html")


def place_list_view(request):
    return HttpResponse("Place list page is under construction.")


@login_required
def post_create_view(request):
    return HttpResponse("Post creation page is under construction.")


@login_required
def my_posts_view(request):
    return HttpResponse("My posts page is under construction.")
