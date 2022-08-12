const pages = document.querySelector("#bottomPagination").cloneNode(true)
const following = document.querySelector("#following")
const profile = document.querySelector("#profile")
const header = document.querySelector("#profileHeader")
const notification = document.querySelector("#notification")

window.onpopstate = event => {
    if (event.persisted) {
        window.location.reload(); 
    }
    if (event.state.section == "following") {
         followings()
    } else if (event.state.section.slice(0, 7) == "profile") {
         profilePage(event.state.section.slice(8))
    } else if (event.state.section == "notifications") {
         notificationPage()
    } else if (event.state.section == "allposts" || event.state.section == "home") {
         removePagination()
         getPage("all_posts")
    } else if (event.state.section.slice(0,4) == "post") {
         getThePost(event.state.section.slice(4))
    } else if (event.state.section.slice(0,4) == "page") {
        let argS = event.state.section.slice(4).split("-")
        console.log(argS[0], argS[1], argS[2])
        removePagination()
        getPage(argS[0], argS[1], parseInt(argS[2]))
    }
}


document.body.addEventListener('click', function() {
    document.body.style.overflow = 'scroll';
});

document.querySelector(".post_form").onsubmit = () => {
    if (document.querySelector(".newPost").value == "") {
        alert("The post must contain at least one character!")
        return false;
    }
    textCorrection(document.querySelector(".newPost"))
}
document.querySelector("#topPagination").append(pages)
giveRemainChar(document.querySelector(".newPost"))


document.addEventListener("DOMContentLoaded", () => {    
    history.pushState({section: `home`}, "", `home`)
    if (header.dataset.profile != "AnonymousUser") {
        let notCount = document.querySelector("#notCount")
        let notIcon = document.querySelector("#notIcon")
        if(notCount.innerHTML != 0) {
            notCount.style.display = "inline-block"

            notIcon.setAttribute("fill", "#1e99ff")
        }
    } 
    removePagination()
    getPage("all_posts")
});


if(following) {
    following.addEventListener("click", () => { 
        followings()
        history.pushState({section: "following"}, "", `following`);
    });
} 

if(document.querySelector("#followingM")) {
    document.querySelector("#followingM").addEventListener("click", () => { 
        followings()
        history.pushState({section: "following"}, "", `following`);
    });
} 

if(profile) {
    let profileName = profile.firstElementChild.textContent
    profile.onclick = () => {
        profilePage(profileName)
        history.pushState({section: `profile-${profileName}`}, "", `profile`);
    }
}

if(notification) {
    notification.onclick = () => {
        notificationPage()
        history.pushState({section: "notifications"}, "", `notifications`)
    }
}


function followings() {
    removePagination()
    getPage("following")
}

function profilePage(profileName) {
    removePagination()
    getPage("profile", profileName)  
}

function notificationPage() {
    document.querySelector("#notCount").style.display = "none"
    document.querySelector("#notIcon").setAttribute("fill", "currentColor")
    removePagination()
    getPage("notification")
    fetch("read_notifications")
    .then(response => response.json())
    .then(result => console.log(result.success))
}

if(document.querySelector("#allPosts")) {
    document.querySelector("#allPosts").addEventListener("click", () => {
        removePagination()
        getPage("all_posts")
        history.pushState({section: "allposts"}, "", `allposts`)
    });
}

if(document.querySelector("#allPostsM")) {
    document.querySelector("#allPostsM").addEventListener("click", () => {
        removePagination()
        getPage("all_posts")
        history.pushState({section: "allposts"}, "", `allposts`)
    });
}


function getProfile(user) {
    header.style.display = "block"
    let userName = `<div id="userName">${user}</div>`
    fetch(`/get_profile/${user}`)
    .then(response => response.json())
    .then(profile => {
        let followButton = `<button id="${user}" class="btn btn-outline-info followButton">follow</button>`
        let unfollowButton = `<button id="${user}" class="btn btn-outline-secondary followButton">unfollow</button>`
        let button = profile.followed ? unfollowButton : followButton
        let image = `<img class="profilePhoto" width=55 src="/static/network/profile.png"></img>`
        let joined = `<span class="joinedDate"><span id="calendar"></span> joined ${profile.joined.split(",")[0]}</span>`
        let followers = `<span class='userCount'>${profile.followers}<span class=userFollow> followers</span></span>`
        let follows = `<span class='userCount'>${profile.follows}<span class=userFollow> follows</span></span>`
        header.innerHTML = `${image}${userName}${profile.selfProfile == user || !profile.selfProfile ? "" : button}${followers}${follows}${joined}`
        document.querySelector("#calendar").innerHTML = calendar

        if (profile.selfProfile != user) {
            theButton = document.querySelector(`.followButton`)
            theButton.onclick = () => follow(theButton.innerHTML, user);
        }
    });
}


function follow(status, user) {
    fetch(`/${status}/${user}`)
    .then(response => response.json())
    .then(data => {
        console.log(data.success)
        getPage("profile", user)
    });
}


function createPostItem(post) {
    let div = document.createElement("div")
    let id = post.thePost.id
    let like = post.like
    let heartIcon = like ? "❤" : "🤍"
    let time = post["thePost"].time.split(",")
    let likes = post.thePost.likes
    let comments = post.thePost.comments
    let content = `<p class="lead postContent">${post.thePost.content}</p><div class="contentBottomLine"></div>`
    let postOwner = `<span class="postOwner">${post.thePost.owner}</span>`
    let clock = `<span class="postClock">${time[0]} ${time[1]}</span>`
    let edited = post.thePost.updated ? (" | edited " + post.thePost.updated) : " "
    let date = `<span class="postDate">${edited}</span>`
    let heart = `<div class="heartIcon heart" data-id="${id}">${heartIcon}</div><span class="heartCount">${likes}</span>`
    let comment = `<div class="comment"><span class="commentIcon">💬</span> <span class="commentCount">${comments}</span> </div>`
    let edit = `<button data-id="${id}" onclick="editPage(event.target)" class="edit btn btn-outline-link btn-sm">🖊️edit</button>`
    let save = `<button data-id="${id}" class="save btn btn-outline-info btn-sm" style="display: none;">SAVE</button>`
    let deletePost = `<button data-id="${id}" onclick="deletePost(event.target.parentElement)" class="delete btn btn-outline-link btn-sm hidden-xs">🗑️delete</button>`
    div.innerHTML = `${postOwner}${clock}${date} ${content}${heart}${comment}${post.isUsers ? edit + save + deletePost: ""}`
    div.setAttribute("data-id", id)
    div.setAttribute("data-comment", post.thePost.comment)
    div.className = "post form-group postItem border border-light"
    div.id = id
    return div
}


function getPosts() {
    fetch(`/all_posts/${arguments[0]}-${arguments[1]}/${arguments[2]}`)
    .then(response => response.json())
    .then(data => {
        if (data.posts.length == 0) {
            document.querySelector("#main").style.display = "none"
            document.querySelector("#all_posts").innerHTML = "<h4>No post yet!</h4>"
        } else {
            data.posts.forEach(post => {
                let div = createPostItem(post)
                let wrapperPost = document.createElement("div")
                wrapperPost.append(div)
                document.querySelector("#all_posts").append(wrapperPost)
                pages.style.display = "block"
                document.querySelector("#bottomPagination").style.display = "block"
            });
            pagination(arguments[2], data.pageCount)
        }
    });
}


function createCommentForm(post, commentForm) {
    commentForm.setAttribute("action", "/comment")
    commentForm.setAttribute("onsubmit", "return false;")
    commentForm.lastElementChild.setAttribute("value", `${post.dataset.id}`)
    commentForm.firstElementChild.nextElementSibling.innerHTML = ""
    commentForm.childNodes["7"].setAttribute("value", "send")
    commentForm.childNodes["7"].className = "btn btn-outline-info btn-sm submitComment"
    commentForm.childNodes["5"].setAttribute("name", "new_comment")
    commentForm.childNodes["5"].setAttribute("placeholder", "Write your comment")
    commentForm.childNodes["5"].setAttribute("rows", "2")
    commentForm.childNodes["5"].value = ""
    commentForm.childNodes["5"].className = "form-control commentText newPost"
    commentForm.lastElementChild.innerHTML = ""
}


function comment(post, icon) {
    if (icon.innerHTML == "💬") {
        icon.innerHTML = "💬..."
        let id = post.dataset.id
        $(`#${id}`).css("background-color", "aliceblue");
        let commentForm = document.querySelector(".send").cloneNode(true)
        createCommentForm(post, commentForm)
        commentForm.childNodes["7"].onclick = () => {
            if (!commentForm.childNodes["5"].value) {
                alert("The post must contain at least one character!")
                return
            }
            textCorrection(commentForm.childNodes["5"])
            fetch("/comment", {
                method: 'POST',
                body: JSON.stringify({
                    postId: post.dataset.id,
                    content: commentForm.childNodes["5"].value
                })
            })
            .then(response => response.json())
            .then(result => {
                console.log(result);
                commentForm.childNodes["5"].value = ""
                removeCommentSections(icon, post)
                comment(post, icon)
            });
            icon.nextElementSibling.innerHTML = parseInt(icon.nextElementSibling.innerHTML) + 1
            window.location.href = `#${post.dataset.id}`
        }
        getComment(post, commentForm)
    } else {
        removeCommentSections(icon, post)
    }
}


function giveRemainChar(element) {
    element.oninput = () => {
        element.parentElement.lastElementChild.innerHTML = element.value.length == 0 ? "" : `${element.value.length}/1000`
        element.parentElement.lastElementChild.style.color = element.value.length > 1000 ? "red" : "black"
    }
}


function removeCommentSections(icon, post) {
    icon.innerHTML = "💬"
    post.style.backgroundColor = "white"
    post.parentElement.style.paddingBottom = "0px"
    while (post.parentElement.lastElementChild.dataset.id != post.dataset.id) {
        post.parentElement.lastElementChild.remove()
    }
}


function getComment(post, commentForm) {
    let page = arguments[2] ? arguments[2] : 1
    fetch(`/get_comment/${post.dataset.id}/${page}`)
    .then(response => response.json())
    .then(data => {
        for (let item of data.list) {
            commentItem = createPostItem(item)
            wrapper = document.createElement("div")
            wrapper.className = "commentWrapper"
            commentItem.className = "post form-group postItem border border-light commentSection"
            wrapper.append(commentItem)
            post.parentElement.appendChild(wrapper)
            post.parentElement.style.paddingBottom = "30px"
            if (wrapper.offsetWidth <= window.innerWidth * 0.40) {
                wrapper.style.paddingLeft = "0%"
                wrapper.style.borderLeft = "none"
            }
        }
        if (data.comments.length > 10 && data.list.length == 10) {
            let load = createLoadItem()
            load.innerHTML = "<h5 class='loadInfo'><i>load more comments</i><h5>"
            post.parentElement.appendChild(load)
            load.onclick = () => {
                load.remove()
                getComment(post, commentForm, page + 1)
            }
        }
        post.parentElement.appendChild(commentForm)
        giveRemainChar(commentForm.childNodes["5"])
    });
}


function pagination(page, pageCount) {
    if (pageCount == 1 || pageCount == "zero") {
        document.querySelector("#main").style.display = "none"
        document.querySelector("#topPagination").style.display = "none"
    } else {
        document.querySelector("#main").style.display = "block"
        document.querySelector("#topPagination").style.display = "block"
    }
    document.querySelectorAll("option").forEach(opt => opt.remove())
    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
        let option = document.createElement("option")
        option.value = pageNum
        option.innerHTML = pageNum
        option.className = "selectedPage"
        document.querySelectorAll("select")[0].append(option.cloneNode(true))
        document.querySelectorAll("select")[1].append(option)
    }
    document.querySelectorAll("select")[1].value = page
    document.querySelectorAll("select")[0].value = page
    document.querySelectorAll(".nextPage").forEach(button => {
        if (page == pageCount) {
            button.style.display = "none"
        } else {
            button.style.display = "block"
            button.setAttribute("data-page", page + 1)
        }
    });
    document.querySelectorAll(".previousPage").forEach(button => {
        if (page == 1) {
            button.style.display = "none"
        } else {
            button.style.display = "block"
            button.setAttribute("data-page", page - 1)
        }
    });
    document.querySelectorAll(".lastPage").forEach(button => {
        button.setAttribute("data-page", pageCount)
        button.innerHTML = pageCount 
    });
}


function removePagination() {
    document.querySelector("#all_posts").innerHTML = ""
    pages.style.display = "none"
}


function deletePost(post)  { 
    let text = [...post.parentElement.childNodes][[...post.parentElement.childNodes].length - 1].firstElementChild.nextElementSibling.nextElementSibling
    let button = text.nextElementSibling
    post.parentElement.style.paddingBottom = "0px"
    if (confirm('Are sure to delete post?')) {
        fetch(`/delete_post/${post.dataset.id}`)
        .then(response => response.json())
        .then(result => {
            console.log(result)
            if (result.success) {
                if (post.dataset.nocom == "noCom") {
                    while(post.nextElementSibling) {
                        post.nextElementSibling.remove()
                    }  
                }
                if (post.dataset.comment == "true") {
                    let count = post.parentElement.parentElement.firstElementChild.childNodes[8].lastElementChild
                    let after = post.parentElement.parentElement.firstElementChild.nextElementSibling.nextElementSibling
                    if ([...after.classList][after.classList.length - 1] == "after") {
                        after.childNodes[8].lastElementChild.innerHTML = parseInt(after.childNodes[8].lastElementChild.innerHTML) - 1
                    } else {
                        count.innerHTML = parseInt(count.innerHTML) - 1
                    }
                }
                if ([...post.childNodes][8].firstElementChild.innerHTML == "💬...") {
                    text.style.margin = "0px";
                    button.style.margin = "0px";
                    [...post.parentElement.childNodes].forEach(node => {
                        node.style.height = "0%";
                        node.remove()
                    })
                }
                post.remove()
            }
        });
    }
}



function editPage(button) {
    var saveButton;
    button.style.display = "none"
    let id = button.dataset.id
    for (let node of document.querySelectorAll(".save")) {
        if (node.dataset.id == id) {
            saveButton = node;
            break;
        }
    }
    saveButton.style.display = "inline-block"
    let text = document.createElement("textarea")
    text.className = "form-control newPost"
    text.value = button.parentElement.childNodes[4].innerHTML
    button.parentElement.childNodes[4].innerHTML = ""
    button.parentElement.childNodes[4].appendChild(text)
    text.oninput = () => {
        if (text.value.length > 1000) {
            saveButton.innerHTML = "Exceeded!"
            saveButton.style.color = "red"
            saveButton.disabled = true
        } else {
            saveButton.innerHTML = "SAVE"
            saveButton.disabled = false
            saveButton.style.color = "#5186cc"
        }
    }
    saveButton.onclick = () => {
        if (!text.value) {
            alert("The post must contain at least one character!")
            return
        }
        textCorrection(text)
        fetch(`/edit/${button.dataset.id}`, {
            method: 'PUT',
            body: JSON.stringify({
                content: text.value
            })
        })
        .then(response => response.json())
        .then(result => {
            console.log(result.success)
            let edited = document.createElement("span")
            edited.innerHTML = " |  " + " edited " + result.time
            console.log(button.parentElement.childNodes)
            button.parentElement.childNodes[4].innerHTML = text.value
            button.parentElement.childNodes[2].innerHTML = ""
            button.parentElement.childNodes[2].append(edited)
            button.style.display = "inline-block"
            saveButton.style.display = "none"
        });
    }
}


function getPage() {
    document.querySelector("#main").style.display = "block"
    document.querySelector("#all_posts").innerHTML = ""
    header.style.display = "none"
    let form = document.querySelector("#new_post_area")
    let title = document.querySelector("#title")
    if (arguments[0] == "all_posts") {
        title.innerHTML = "All Posts"
    } else if (arguments[0] == "following") {
        title.innerHTML = "From Your Followings<hr>"
    } else if (arguments[0] == "profile") {
        title.innerHTML = ""
        getProfile(arguments[1])
    } else if (arguments[0] == "notification") {
        title.innerHTML = "Notifications:<hr>"
        document.querySelector("#main").style.display = "none"
        getNotifications()
    } else if (arguments[0].slice(0,4) == "post") {
        title.innerHTML = ""
        getThePost(arguments[0].slice(4))
    }
    arguments[0] == "all_posts" && following ? form.style.display = "block" : form.style.display = "none"
    if (arguments[0] != "notification" && arguments[0].slice(0,4) != "post") {
        clickPages(arguments[0], arguments[1])
        selectPages(arguments[0], arguments[1])
        let pageNum = arguments[2] ? arguments[2] : 1
        getPosts(arguments[0], arguments[1], pageNum)
    }
}


function getThePost() {
    if (arguments.length == 2 || arguments.length == 4) {
        cleanPage(arguments[1])
    } else {
        cleanPage()
    }
    fetch(`/get_post/${arguments[0]}`)
    .then(response => response.json())
    .then(post => {
        let div = createPostItem(post)
        document.querySelector("#all_posts").append(div)
        if (arguments[1] != "noCom") {
            comment(div, div.childNodes[8].firstElementChild)
        }
        if (arguments[1] == "after") {
            div.classList.add("after")
        } else if (arguments[1] == "noCom") {
            div.setAttribute("data-nocom", "noCom")
            div.childNodes[8].firstElementChild.onclick = () => {
                document.querySelectorAll(".dots").forEach(item => {
                    let nodes = []
                    let lastElement = item.nextElementSibling;
                    while(lastElement) {
                        nodes.push(lastElement)
                        lastElement = lastElement.nextElementSibling
                    }
                    nodes.forEach(node => node.remove())
                    item.remove()
                })
            }
        }
        if (arguments.length == 4) {
            let dots = document.createElement("div")
            dots.className = "dots"
            document.querySelector("#all_posts").append(dots)
            getThePost(arguments[2], arguments[3])
        } 
    })
}


function cleanPage() {
    if (arguments[0] != "after") {
        document.querySelector("#all_posts").innerHTML = ""
    }
    document.querySelector("#new_post_area").style.display = "none"
    document.querySelector("#title").innerHTML = ""
    document.querySelector("#profileHeader").style.display = "none"
    document.querySelector("#main").style.display = "none"
    document.querySelector("#topPagination").style.display = "none"
}


function getNotifications() {
    let page = arguments[0] ? arguments[0] : 1
    fetch(`/get_notifications/${page}`)
    .then(response => response.json())
    .then(data => {
        let notWrapper = document.createElement("div")
        let the_person = person
        for (let notification of data.notList) {
            let notItem = document.createElement("div")
            notItem.className = "border border-left-0 border-top-0 border-right-0 border-info notItem"
            notItem.setAttribute("data-content", notification.content_id)
            notItem.setAttribute("data-main", notification.main_id)
            notItem.setAttribute("data-type", notification.type)
            let time = `<span class="notTime">${notification.time}</span>`
            if (notification.type == "follow") {
                notItem.innerHTML = `${time}<span class="notBody">${the_person} <span class="maker">${notification.maker}</span></span> follows you `
            } else if (notification.type == "like") {
                notItem.innerHTML = `${time}<span class="notBody">${heart} <span class="maker">${notification.maker}</span></span> liked your post: ${getRepr(notification, "content")}`
            } else if (notification.type == "reply") {
                notItem.innerHTML = `${time}<span class="notBody">${chat} <span class="maker">${notification.maker}</span></span> replied: ${getRepr(notification, "content")} to your post ${getRepr(notification, "reply_to")}`
            }
            if (notification.read == true) {
                notItem.style.backgroundColor = "#d1d0d02a"
            }
            notWrapper.append(notItem)
        }
        if (data.notifications.length > 10 && data.notList.length == 10) {
            let load = createLoadItem()
            load.innerHTML = "<h5 class='loadInfo notLoad'><i>load more</i><h5>"
            notWrapper.appendChild(load)
            load.onclick = () => {
                load.remove()
                getNotifications(page + 1)
            }
        }
        document.querySelector("#all_posts").append(notWrapper)
    });
}


function createLoadItem() {
    let load = document.createElement("div")
    load.style.width = "50%"
    load.style.paddingLeft = "2.5%" 
    return load
}


function getRepr(notification, content) {
    let contentRepr = notification[content].length > 10 ? notification[content].slice(0, 10) + "..." : notification[content]
    return `<span class="contentRepr"><i class="toOpenPost">\"${contentRepr}\"</i></span>`
}


function clickPages(status, profile) {
    document.querySelectorAll(".page-link").forEach(pageButton => {
        pageButton.onclick = () => {
            let pageNum = parseInt(pageButton.dataset.page)
            removePagination()
            document.querySelector("#bottomPagination").style.display = "none"
            let pro = profile ? profile : ""
            history.pushState({section: `page${status ? status : ""}-${pro}-${pageNum}`}, "", `pages`)
            getPosts(status, profile, pageNum)    
        }
    });
}


function selectPages(status, profile) {
    document.querySelectorAll(".form-select").forEach(pageButton => {
        pageButton.onchange = () => {
            let pageNum = parseInt(pageButton.value)
            removePagination()
            document.querySelector("#bottomPagination").style.display = "none"
            let pro = profile ? profile : ""
            history.pushState({section: `page${status ? status : ""}-${pro}-${pageNum}`}, "", `pages`)
            getPosts(status, profile, pageNum)
        }
    });
}


function textCorrection(element) {
    while (element.value.includes("\n")) {
        element.value = element.value.replace("\n", "<br>");
    };
};


$(window).click(function(event) {
        let icon = event.target
        let likes = icon.nextElementSibling
        console.log(icon)    
        if (icon.classList[0] == "heartIcon") {
            if (header.dataset.profile == "AnonymousUser") {
                window.location.href = `/login`
            }
            if (icon.innerHTML == "🤍") {
                fetch(`/like_post/${icon.dataset.id}`)
                .then(response => response.json())
                .then(result => {
                    console.log(result)
                    if (result.success) {
                        icon.innerHTML = "❤";
                        likes.innerHTML = parseInt(likes.innerHTML) + 1;
                    }
                });
            } else if (icon.innerHTML == "❤") {
                fetch(`/unlike_post/${icon.dataset.id}`)
                .then(response => response.json())
                .then(result => {
                    console.log(result)
                    if (result.success) {
                        icon.innerHTML = "🤍";
                        likes.innerHTML = parseInt(likes.innerHTML) - 1;
                    }
                });
            }
        } else if (icon.className == "postOwner" || icon.className == "maker") {
            if (header.dataset.profile != "AnonymousUser") {
                removePagination()
                getPage("profile", icon.innerHTML)
                history.pushState({section: `profile-${icon.innerHTML}`}, "", `profile`)
            } else {
                alert("Login to see profile.")
            }
        } else if (icon.className == "commentIcon") {
            if (header.dataset.profile == "AnonymousUser") {
                window.location.href = `/login`
            }
            if (event.persisted) {
                window.location.reload(); 
            }
            comment(icon.parentElement.parentElement, icon)
        } else if ([...icon.classList].includes("postItem")) {
            if (header.dataset.profile != "AnonymousUser") {
                getThePost(icon.id)
                history.pushState({section: `post${icon.id}`}, "", `post`)
            }
        } else if ([...icon.classList].includes("postContent")) {
            if (header.dataset.profile != "AnonymousUser") {
                getThePost(icon.parentElement.id)
                history.pushState({section: `post${icon.parentElement.id}`}, "", `post`)
            }
        } else if ((icon.className == "toOpenPost" && icon.parentElement.parentElement.dataset.type == "reply") || icon.dataset.type == "reply") {
            if (icon.parentElement.parentElement.dataset.type == "reply") {
                let postId = icon.parentElement.parentElement.dataset.main
                let postId2 = icon.parentElement.parentElement.dataset.content
                getThePost(postId, "noCom", postId2, "after")  
                history.pushState({section: `post${postId}`}, "", `post`)
            } else if (icon.dataset.type == "reply") {
                getThePost(icon.dataset.main, "noCom", icon.dataset.content, "after")
                history.pushState({section: `post${icon.dataset.main}`}, "", `post`)
            }
        } else if ((icon.className == "toOpenPost" && icon.parentElement.parentElement.dataset.type == "like") || icon.dataset.type == "like") {
            if (icon.className == "toOpenPost") {
                let postId = icon.parentElement.parentElement.dataset.content
                getThePost(postId)
                history.pushState({section: `post${postId}`}, "", `post`)
            } else {
                getThePost(icon.dataset.content)
                history.pushState({section: `post${icon.dataset.content}`}, "", `post`)
            }
        }
    });   



