
def get_comment_tree(request, post, liked_before, is_users_post):
    post_main = post.comment_to
    post_root_to_json = ""
    if post_main.comment_to is not None:
        post_root = post_main.comment_to
        while post_root.comment_to:
            post_root = post_root.comment_to
        post_root_to_json = {
            "thePost": post_root.serialize(), 
            "like": request.user in post_root.likers.all(), 
            "isUsers": post_root.owner == request.user
        }
    return {
        "postRoot": post_root_to_json,
        "postMain": {
            "thePost": post_main.serialize(),
            "like": request.user in post_main.likers.all(),
            "isUsers": post_main.owner == request.user
        },
        "postComment": {
            "thePost": post.serialize(), 
            "like": liked_before, 
            "isUsers": is_users_post
        }
    }
    