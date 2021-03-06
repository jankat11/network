
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


from .models import User, Post, Notification


def index(request):
    if request.method == "POST":
        the_content = request.POST["new_post"]
        if len(the_content) > 1000:
            return HttpResponse("<h1>Your post is over the character limit.!</h1>")
        Post.objects.create(owner=request.user, content=the_content)
        return HttpResponseRedirect(reverse("index"))

    if len(request.user.username) != 0:
        not_count = Notification.objects.filter(owner=request.user, read=False).all().count()
        return render(request, "network/index.html", {
            "not_count": not_count
        })
    else:
        return render(request, "network/index.html")


def all_posts(request, post_type, page=1):
    if post_type.split("-")[0] == "all_posts":
        posts = []
        for post in Post.objects.filter(comment=False).order_by("-id"):
            is_users_post = post.owner == request.user
            liked_before =  request.user in post.likers.all()
            posts.append({"thePost": post.serialize(), "like": liked_before, "isUsers": is_users_post})
        pages = Paginator(posts, 10)
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
        pages = Paginator(sorted_posts, 10)
        return JsonResponse({
            "posts": pages.page(page).object_list,
            "pageCount" : pages.num_pages or "zero"
        })
    elif post_type.split("-")[0] == "profile":
       
        user_name = post_type.split("-")[1]
        the_user = User.objects.get(username=user_name)
        posts = []
        for post in Post.objects.filter(owner=the_user, comment=False).order_by("-id"):
            is_users_post = post.owner == request.user
            liked_before =  request.user in post.likers.all()
            posts.append({"thePost": post.serialize(), "like": liked_before, "isUsers": is_users_post})
        pages = Paginator(posts, 10)
        return JsonResponse({
            "posts": pages.page(page).object_list,
            "pageCount" : pages.num_pages or "zero"
        })


def get_post(request, post_id):
    post = Post.objects.get(id=int(post_id))
    is_users_post = post.owner == request.user
    liked_before =  request.user in post.likers.all()
    return JsonResponse({"thePost": post.serialize(), "like": liked_before, "isUsers": is_users_post})


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
        "comments" : comments,
        "list" : commentList.page(page).object_list
    })

     
def get_profile(request, user_name):
    user = User.objects.get(username=user_name)
    followers = user.followers
        
    return JsonResponse({
        "follows" : user.follows.count(),
        "followers" : followers.count(),
        "joined" : user.joined(),
        "selfProfile": request.user.username,
        "followed": followers.filter(username=request.user.username).count() != 0
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


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password == "":
            return render(request, "network/register.html", {
                "message": "Please fill requirements"
            })
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")


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
