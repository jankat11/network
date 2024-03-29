
from django.urls import path
from . import views

urlpatterns = [
    #Template Pages
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("settings", views.settings, name="settings"),

    # APIs
    path("get_profile/<str:user_name>", views.get_profile, name="get_profile"),
    path("get_follow_results/<str:user_name>/<int:page>", views.get_follow_results, name="get_follow_results"),
    path("all_posts/<str:post_type>/<int:page>/<str:status>", views.all_posts, name="all_posts"),
    path("like_post/<int:post_id>", views.like_post, name="like_post"),
    path("unlike_post/<int:post_id>", views.unlike_post, name="unlike_post"),
    path("follow/<str:user_name>", views.follow, name="follow"),
    path("unfollow/<str:user_name>", views.unfollow, name="unfollow"),
    path("edit/<str:post_id>", views.edit, name="edit"),
    path("delete_post/<str:post_id>", views.delete_post, name="delete_post"),
    path("comment", views.comment, name="comment"),
    path("get_comment/<str:post_id>/<int:page>", views.get_comment, name="get_comment"),
    path("get_notifications/<int:page>", views.get_notifications, name="get_notifications"),
    path("read_notifications", views.read_notifications, name="read_notifications"),
    path("get_post/<int:post_id>", views.get_post, name="get_post"),
    path("search/<str:user>/<int:page>", views.search, name="search"),
    path("edit_about_user", views.edit_about_user, name="edit_about_user"),
    path("send_mail_to_user", views.send_mail_to_user, name="send_mail_to_user"),
  

    #index redirecting
    path("allposts", views.allposts, name="allposts"),
    path("following", views.following, name="following"),
    path("notifications", views.notifications, name="notifications"),
    path("home", views.home, name="home"),
    path("profile", views.profile, name="profile"),
    path("pages", views.pages, name="pages"),
    path("post", views.post, name="post"),
]

