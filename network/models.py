
from django.contrib.auth.models import AbstractUser
from django.db import models


SLICE = 5

class User(AbstractUser):
    follows = models.ManyToManyField("self", blank=True, symmetrical=False, related_name="followers") 
    
    def joined(self):
        return self.date_joined.strftime("%b %Y, %I:%M %p")

    def __str__(self):
        return self.username


class Post(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="posted")
    content = models.TextField(max_length=1000)
    likers = models.ManyToManyField(User, blank=True, related_name="liked_posts")
    time = models.DateTimeField(auto_now_add=True)
    updated = models.CharField(max_length=250, null=True, blank=True)
    comment = models.BooleanField(default=False)
    comment_to = models.ForeignKey("self", on_delete=models.CASCADE, related_name="comments", null=True, blank=True)

    def content_repr(self):
        return "".join(self.content)[:SLICE]

    def __str__(self):
        return f"{self.owner} said {self.content_repr()}..."
    
    def serialize(self):
        return {
            "id": self.id,
            "owner": self.owner.username,
            "content": self.content,
            "time": self.time.strftime("%b %d %Y, %I:%M %p"),
            "comment": self.comment,
            "comments": self.comments.count(),
            "likes": self.likers.count(),
            "updated": self.updated
        }

class Notification(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notifications")
    maker = models.ForeignKey(User, on_delete=models.CASCADE, related_name="activities")
    read = models.BooleanField(default=False)
    time = models.DateTimeField(auto_now_add=True)
    content = models.ForeignKey(Post, on_delete=models.CASCADE, blank=True, null=True)
    reply = models.ForeignKey(Post, on_delete=models.CASCADE, blank=True, null=True, related_name="replies")
    not_type = models.CharField(max_length=1000)
    
    def serialize(self):
        return {
            "owner": self.owner.username,
            "maker": self.maker.username,
            "read": self.read,
            "time": self.time.strftime("%b %d %Y, %I:%M %p"),
            "type": self.not_type,
            "content": self.content.content if self.content else "",
            "content_id": self.content.id if self.content else "",
            "reply_to": self.reply.content if self.reply else "",
            "main_id": self.reply.id if self.reply else "",
        }





