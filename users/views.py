from django.shortcuts import render, redirect
from django.contrib.auth import login, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .forms import RegisterForm, LoginForm, ProfileUpdateForm


def register_view(request):
    if request.user.is_authenticated:
        return redirect("home")
    form = RegisterForm(request.POST or None)
    if request.method == "POST" and form.is_valid():
        user = form.save()
        login(request, user)
        messages.success(request, "Account created successfully!")
        return redirect("home")
    return render(request, "users/register.html", {"form": form})


def login_view(request):
    if request.user.is_authenticated:
        return redirect("home")
    form = LoginForm(request, data=request.POST or None)
    if request.method == "POST" and form.is_valid():
        user = form.get_user()
        login(request, user)
        messages.success(request, f"Welcome back, {user.get_full_name()}!")
        next_url = request.GET.get("next", "home")
        return redirect(next_url)
    return render(request, "users/login.html", {"form": form})


def logout_view(request):
    logout(request)
    messages.info(request, "You have been logged out.")
    return redirect("home")


@login_required
def profile_view(request):
    return render(request, "users/profile.html", {"user": request.user})


@login_required
def profile_update_view(request):
    form = ProfileUpdateForm(
        request.POST or None, request.FILES or None, instance=request.user
    )
    if request.method == "POST" and form.is_valid():
        form.save()
        messages.success(request, "Profile updated successfully!")
        return redirect("profile")
    return render(request, "users/profile_update.html", {"form": form})
