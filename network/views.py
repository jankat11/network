
import json
import time

from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from django.core.paginator import Paginator
from django import forms

from. util import get_comment_tree
from .models import User, Post, Notification


class LoginForm(forms.Form):
    username = forms.CharField(min_length=2, max_length=45, label="", strip=True,
        widget=forms.TextInput(attrs={"placeholder": "Username", "class": "form-control form-group login"}))
    password = forms.CharField(label="", min_length=6, 
        widget=forms.PasswordInput(attrs={"placeholder": "Password", "class": "form-control form-group login"}))

 
class RegisterForm(forms.Form):
    username = forms.CharField(label="", min_length=2, strip=True, max_length=45, 
        widget=forms.TextInput(attrs={"placeholder": "Username", "class": "form-control form-group login"}))
    email = forms.EmailField(label="",
        widget=forms.EmailInput(attrs={"placeholder": "Email", "class": "form-control form-group login"}))
    password = forms.CharField(label="", min_length=6, 
        widget=forms.PasswordInput(attrs={"placeholder": "Password", "class": "form-control form-group login"}))
    confirmation = forms.CharField(label="", min_length=6,
        widget=forms.PasswordInput(attrs={"placeholder": "Confirm Password", "class": "form-control form-group login"}))


class PostForm(forms.Form):
    new_post = forms.CharField(label="", max_length=1000,
        widget=forms.Textarea(attrs={"placeholder": "What are you thinking?", "class": "form-control newPost shadow-none", "rows": "4"}))


class SearchForm(forms.Form):
    user = forms.CharField(label="", min_length=1, 
        widget=forms.TextInput(attrs={"placeholder": "Search profile", "class": "form-control searchInput shadow-none"}))


def index(request):
    if request.method == "POST":
        form = PostForm(request.POST)
        if form.is_valid():
            the_content = form.cleaned_data["new_post"]
            if len(the_content) > 1000:
                return HttpResponse("<h1>Your post is over the character limit.!</h1>")
            Post.objects.create(owner=request.user, content=the_content)
            return HttpResponseRedirect(reverse("index"))
        else:
            return HttpResponseRedirect(reverse("index"))
    if len(request.user.username) != 0:
        not_count = Notification.objects.filter(owner=request.user, read=False).all().count()
        return render(request, "network/index.html", {
            "not_count": not_count,
            "postForm": PostForm(),
            "searchForm": SearchForm()
        })
    else:
        return render(request, "network/index.html", {
            "postForm": PostForm(),
            "searchForm": SearchForm()
        })


def all_posts(request, post_type, page=1, status="post"):
    if post_type.split("-")[0] == "all_posts":
        posts = []
        for post in Post.objects.filter(comment=False).order_by("-id"):
            is_users_post = post.owner == request.user
            liked_before =  request.user in post.likers.all()
            posts.append({"thePost": post.serialize(), "like": liked_before, "isUsers": is_users_post})
        pages = Paginator(posts, 25)
        return JsonResponse({
            "posts": pages.page(page).object_list,
            "pageCount" : pages.num_pages or "zero"
        })
    elif post_type.split("-")[0] == "following":
        posts = []
        for user in request.user.follows.all():
            follower_posts = Post.objects.filter(owner=user, comment=False)
            for post in follower_posts:
                is_users_post = post.owner == request.user
                liked_before =  request.user in post.likers.all()
                posts.append({"thePost": post.serialize(), "like": liked_before, "isUsers": is_users_post})
        sorted_posts = sorted(posts, key=lambda post : post["thePost"]["id"], reverse=True)
        pages = Paginator(sorted_posts, 25)
        return JsonResponse({
            "posts": pages.page(page).object_list,
            "pageCount" : pages.num_pages or "zero"
        })
    elif post_type.split("-")[0] == "profile":
        user_name = post_type.split("-")[1]
        the_user = User.objects.get(username=user_name)
        posts = []
        for post in Post.objects.filter(owner=the_user, comment=False if status == "post" else True).order_by("-id"):
            is_users_post = post.owner == request.user
            liked_before =  request.user in post.likers.all()
            if status == "post":
                posts.append({"thePost": post.serialize(), "like": liked_before, "isUsers": is_users_post})
            else:
                posts.append(get_comment_tree(request, post, liked_before, is_users_post))
        pages = Paginator(posts, 25)
        return JsonResponse({
            "posts": pages.page(page).object_list,
            "pageCount" : pages.num_pages or "zero"
        })


def get_post(request, post_id):
    post = Post.objects.get(id=int(post_id))
    is_users_post = post.owner == request.user
    liked_before =  request.user in post.likers.all()
    return JsonResponse(get_comment_tree(request, post, liked_before, is_users_post))


@csrf_exempt
@login_required
def comment(request):
    if request.method == "POST":
        data = json.loads(request.body)
        if data.get("content") is not None:
            new_comment_content = data["content"]
            if len(new_comment_content) > 1000:
                return HttpResponse("<h1>Your post is over the character limit.!</h1>")
            commented = Post.objects.get(id=int(data["postId"]))
            the_comment = Post.objects.create(owner=request.user, content=new_comment_content, comment=True, comment_to=commented)
            if commented.owner != request.user:
                Notification.objects.create(owner=commented.owner, maker=request.user, content=the_comment, reply=commented, not_type="reply")
            return JsonResponse(
                {"success": "comment sent succesfully"}
            )
        else:
            return JsonResponse(
                {"error": "error"}
            )
    

def get_comment(request, post_id, page=1):
    comments = []
    post = Post.objects.get(id=int(post_id))
    for comment in post.comments.all():
        is_users_post = request.user == comment.owner
        sort_key = "1" if is_users_post else "2"
        liked_before = request.user in comment.likers.all() 
        comments.append({"thePost": comment.serialize(), "like": liked_before, "isUsers": is_users_post, "sortkey": sort_key})
    commentList = Paginator(sorted(comments, key=lambda item: item["sortkey"]), 10)
    return JsonResponse({
        "list" : commentList.page(page).object_list,
        "hasNext": commentList.page(page).has_next()
    })

     
def get_profile(request, user_name):
    user = User.objects.get(username=user_name)
    followers = user.followers
    about = user.about
    the_user = request.user.username
    return JsonResponse({
        "about": about,
        "follows" : user.follows.count(),
        "followers" : followers.count(),
        "joined" : user.joined(),
        "selfProfile": the_user,
        "followed": followers.filter(username=the_user).count() != 0 
    })


@csrf_exempt
def edit_about_user(request):
    if request.method == "PUT":
        about = json.loads(request.body)
        request.user.about = about["content"].replace("\n", " ").strip()
        request.user.save()
        return JsonResponse({
            "success": "succesfully edited"
        })
        

def get_follow_results(request, user_name, page):
    follower_page = ""
    follow_page = ""
    user = User.objects.get(username=user_name)
    follower_list = Paginator([follower.username for follower in user.followers.all()], 30)
    follow_list = Paginator([follow.username for follow in user.follows.all()], 30)
    try:
        follower_page = follower_list.page(page).object_list 
    except:
        pass
    try:
        follow_page = follow_list.page(page).object_list
    except:
        pass
    return JsonResponse({
        "followerList": follower_page,
        "followList": follow_page
    })


@login_required
def follow(request, user_name):
    user = User.objects.get(username=user_name)
    user.followers.add(request.user)
    Notification.objects.create(owner=user, maker=request.user, not_type="follow")
    return JsonResponse({"success": "user succesfuly followed"}, status=200)


@login_required
def get_notifications(request, page):
    notifications = request.user.notifications.all().order_by("-id")
    the_list = [notification.serialize() for notification in notifications]
    not_list = Paginator(the_list, 10)
    return JsonResponse({"notList": not_list.page(page).object_list,  "notifications": the_list})


login_required
def read_notifications(request):
    unread = Notification.objects.filter(owner=request.user, read=False).all()
    for notification in unread:
        notification.read = True
        notification.save()
    return JsonResponse({"success": "succesfully read"})


@login_required
def unfollow(request, user_name):
    user = User.objects.get(username=user_name)
    user.followers.remove(request.user)
    return JsonResponse({"success": "user succesfuly unfollowed"}, status=200)


@csrf_exempt
@login_required
def edit(request, post_id):
    if request.method == "PUT":
        post = Post.objects.get(id=int(post_id))
        data = json.loads(request.body)
        if data.get("content") is not None:
            post.content = data["content"]
            post.updated = time.strftime("%b %d %Y, %I:%M %p")
            post.save()
            return JsonResponse(
                {"success": "succesfully edited",
                "time": post.serialize()["updated"]}
            )
        else:
            return JsonResponse(
                {"error": "error"}
            )

@login_required
def delete_post(request, post_id):
    try:
        post = Post.objects.get(id=post_id)
        post.delete()
    except:
        return JsonResponse({"error": "error"})
    return JsonResponse({"success": "post was successfully deleted"}, status=200)


@login_required
def like_post(request, post_id):
    try:
        post = Post.objects.get(id=post_id)
    except:
        return JsonResponse({"error": "post not found."}, status=404)
    if request.user.liked_posts.filter(id=post_id).count() != 0:
        return JsonResponse({"error": "the post was already liked."}, status=404)
    if post.owner != request.user:
        Notification.objects.create(owner=post.owner, maker=request.user, content=post, not_type="like")
    post.likers.add(request.user)
    
    return JsonResponse({"success": "the post was succesfully liked"}, status=200)


@login_required
def unlike_post(request, post_id):
    try:
        post = Post.objects.get(id=post_id)
        post.likers.remove(request.user)
    except:
        return JsonResponse({"error": "post not found."}, status=404)

    return JsonResponse({"success": "the like succesfully gotten back"}, status=200)


@login_required
def search(request, user, page):  
    users = User.objects.filter(username__contains=user).all()
    result = Paginator(sorted([user.username for user in users]), 10)
    return JsonResponse(result.page(page).object_list, safe=False)


def login_view(request):
    if request.method == "POST":
        # Attempt to sign user in
        form = LoginForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data["username"]
            password = form.cleaned_data["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password.",
                "loginForm": LoginForm()
            })
    else:
        return render(request, "network/login.html", {
            "loginForm" : LoginForm()
        })


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        form = RegisterForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data["username"]
            email = form.cleaned_data["email"]
            # Ensure password matches confirmation
            password = form.cleaned_data["password"]
            confirmation = form.cleaned_data["confirmation"]

            if password == "":
                return render(request, "network/register.html", {
                    "message": "Please fill requirements",
                    "registerForm": RegisterForm()
                })
            if password != confirmation:
                return render(request, "network/register.html", {
                    "message": "Passwords must match.",
                    "registerForm": RegisterForm()
                })

            # Attempt to create new user
            try:
                user = User.objects.create_user(username, email, password)
                user.save()
            except IntegrityError:
                return render(request, "network/register.html", {
                    "message": "Username already taken.",
                    "registerForm": RegisterForm()
                })
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/register.html", {
                "message": "Check for valid e-mail address or username",
                "registerForm": RegisterForm()
            })
    else:
        return render(request, "network/register.html", {
            "registerForm": RegisterForm()
        })


# For history status http redirections:

def allposts(request):
   return HttpResponseRedirect(reverse("index"))

def following(request):
   return HttpResponseRedirect(reverse("index"))

def notifications(request):
    return HttpResponseRedirect(reverse("index"))

def home(request):
    return HttpResponseRedirect(reverse("index"))

def profile(request):
    return HttpResponseRedirect(reverse("index"))

def pages(request):
    return HttpResponseRedirect(reverse("index"))

def post(request):
    return HttpResponseRedirect(reverse("index"))
