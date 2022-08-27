
const following = document.querySelector("#following")
const profile = document.querySelector("#profile")
const header = document.querySelector("#profileHeader")
const notification = document.querySelector("#notification")
const desktopS = document.querySelector("#desktopS") ? document.querySelector("#desktopS") : ""

window.onpopstate = event => {
    desktopS ? desktopS.setAttribute("data-bs-target", "#searchIcon2") : ""
    $('.collapse').collapse("hide")
    event.persisted ? window.location.reload() : ""; 
    if (event.state) {
        if (event.state.section == "following") {
            autoLoad("following", "From Your Followings<hr>", "none", "following", "")
        } else if (event.state.section.slice(0, 7) == "profile") {
            getProfile(event.state.section.slice(8))
            autoLoad("profile", "<span></span>", "none", "profile", event.state.section.slice(8))
        } else if (event.state.section.slice(0, 1) == "C"){
            document.querySelector("#title").innerHTML = ""
            let list = event.state.section.split("-")
            if (list.length == 2) {
                getProfile(event.state.section.slice(9))
                getPostHelper("profile", event.state.section.slice(9), 1, "comment")
            } else if (list.length == 3) {
                getProfile(list[1])
                getPostHelper("profile", list[1], list[2], "comment")
            }
        } else if (event.state.section == "notifications") {
            notificationPage()
        } else if (event.state.section == "allposts" || event.state.section == "home") {
            newPost = $(header).data("profile") == "AnonymousUser" ? "none" : "block"
            autoLoad("allPost", "All Posts",  newPost, "all_posts", "")      
        } else if (event.state.section.slice(0,4) == "post") {
            getThePost(event.state.section.slice(4))
        } else if (event.state.section.slice(0,4) == "page") {
            let argS = event.state.section.slice(4).split("-")
            removePagination()
            getPage(argS[0], argS[1], parseInt(argS[2]))
        }
    }
}


document.body.addEventListener('click', function() {
    document.body.style.overflow = 'scroll';
});

document.querySelector(".post_form").onsubmit = () => {
    textCorrection(document.querySelector(".newPost"))
}

giveRemainChar(document.querySelector(".newPost"))


document.addEventListener("DOMContentLoaded", () => {   
    localStorage.clear()
    setLocals()
    history.pushState({section: `home`}, "", `home`)
    if (header.dataset.profile != "AnonymousUser") {
        let notCount = document.querySelector("#notCount")
        let notCountM = document.querySelector("#notCountM")
        let notIcon = document.querySelector("#notIcon")
        let notIconM = document.querySelector("#notIconM")
        if(notCount.innerHTML != 0) {
            notCount.style.display = "inline-block"
            notCountM.style.display = "inline-block"
            notIcon.setAttribute("fill", "#1e99ff")
            notIconM.setAttribute("fill", "#1e99ff")
        }
    } 
    removePagination()
    getPage("all_posts")
});


$(".searchB").each(function() {
    $(this).click(function() {
        let value = $(this).parent().prev().val()
        if (!value) {
            $("#alertEmptySearch").click()
            return
        }
        let results = $("#searchResults")
        $(results).html('<div class="searchPillow"></div>') 
        let page = 1
        getUserSearch(value, page, results)
    })
});

$(".searchB2").each(function() {
    $(this).click(function() {
        let value =  $(this).parent().prev().val()
        if (!value) {
            $("#alertEmptySearch").click()
            setTimeout(() => $('#searchIcon2').collapse("hide"), 2000)
        }
        let results = $("#searchResults2")
        $(results).html('<div class="searchPillow"></div>') 
        let page = 1
        !value ? value = "emptyResultHasBeenEnteredTag" : ""
        getUserSearch(value, page, results)
    })
});


if(following) {
    following.addEventListener("click", () => { 
        localStorage.setItem("following", 0)
        localStorage.setItem("followingOrder", 1)
        followings()
        history.pushState({section: "following"}, "", `following`);
        $('.collapse').collapse("hide");
    });
} 

if(document.querySelector("#followingM")) {
    document.querySelector("#followingM").addEventListener("click", () => { 
        localStorage.setItem("following", 0)
        localStorage.setItem("followingOrder", 1)
        followings()
        history.pushState({section: "following"}, "", `following`);
        $('.collapse').collapse("hide");
    });
} 

if(profile) {
    let profileName = profile.firstElementChild.textContent
    profile.onclick = () => {
        localStorage.setItem("profile", 0)
        localStorage.setItem("profileOrder", 1)
        profilePage(profileName)
        history.pushState({section: `profile-${profileName}`}, "", `profile`);
        desktopS ? desktopS.setAttribute("data-bs-target", "#searchIcon2") : ""
        $('.collapse').collapse("hide");
    }
}

if(document.querySelector("#profileM")) {
    let profileName = document.querySelector("#profileM").firstElementChild.dataset.profile
    document.querySelector("#profileM").onclick = () => {
        localStorage.setItem("profile", 0)
        localStorage.setItem("profileOrder", 1)
        profilePage(profileName)
        history.pushState({section: `profile-${profileName}`}, "", `profile`);
        $('.collapse').collapse("hide");
    }
}


if(notification) {
    notification.onclick = () => {
        notificationPage()
        history.pushState({section: "notifications"}, "", `notifications`)
        desktopS ? desktopS.setAttribute("data-bs-target", "#searchIcon2") : ""
        $('.collapse').collapse("hide");
    }
}

if(document.querySelector("#notificationM")) {
    document.querySelector("#notificationM").onclick = () => {
        notificationPage()
        history.pushState({section: "notifications"}, "", `notifications`)
        $('.collapse').collapse("hide");
    }
}


if(document.querySelector("#searArea")) {
    document.querySelector("#searArea").onclick = () => {
        $('.collapse').collapse("hide");
    }
}


if(document.querySelector(".mLink")) {
    document.querySelectorAll(".mLink").forEach(link => {
        link.onclick = () => document.querySelector(".hamburger").click()
    })
}


function autoLoad(request, titleContent, newPost, postKey, profileName) {
    let previousElement = localStorage.getItem(request) != 0 ? localStorage.getItem(request) : "padding"
    let previousElementOrder = localStorage.getItem(`${request}Order`) != 0 ? localStorage.getItem(`${request}Order`) : 1
    previousElementOrder = parseInt(previousElementOrder)
    let lastPage = previousElementOrder % 25 == 0 ? Math.floor((previousElementOrder / 25)) : Math.floor((previousElementOrder / 25) + 1)
    let page = 1
    request == "profile" ? cleanPagePart() : cleanPage() 
    title.innerHTML = titleContent
    document.querySelector("#new_post_area").style.display = newPost;
    (function recursivePageLoad() {
        if (page <= lastPage) {
            let auto = page != lastPage ? "auto" : ""
            return getPosts(postKey, profileName, page, "post", auto) 
            .then(() => page++)
            .then(() => recursivePageLoad()) 
        }  
    })()
    function scroll() {
        if (document.querySelector(`#${previousElement}`))
        document.querySelector(`#${previousElement}`).scrollIntoView({behavior: "auto", block: "center", inline: "nearest"}) 
    }
    document.addEventListener('DOMNodeInserted', scroll)
    
    setTimeout(() => { 
        document.removeEventListener('DOMNodeInserted', scroll)
    }, 1000)
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
    removePagination()
    getPage("notification", not = document.querySelector("#amount").innerHTML)

}

if(document.querySelector("#allPosts")) {
    document.querySelector("#allPosts").addEventListener("click", () => {
        localStorage.setItem("allPost", 0)
        localStorage.setItem("allPostOrder", 1)
        removePagination()
        getPage("all_posts")
        history.pushState({section: "allposts"}, "", `allposts`)
        $('.collapse').collapse("hide");
    });
}

if(document.querySelector("#allPostsM")) {
    document.querySelector("#allPostsM").addEventListener("click", () => {
        localStorage.setItem("allPost", 0)
        localStorage.setItem("allPostOrder", 1)
        removePagination()
        getPage("all_posts")
        history.pushState({section: "allposts"}, "", `allposts`)
        $('.collapse').collapse("hide");
    });
}


function getProfile(user) {
    document.querySelector("#followResultArea").innerHTML = `<div class="collapse followerArea theFollowArea" id="followerArea"><div><div class="followTitle">Followers:</div><div id="listFw"></div></div></div><div class="collapse followArea theFollowArea" id="followArea"><div><div class="followTitle">Follows:</div><div id="listF"></div></div></div>`
    let closeButtonFollow = '<div id="closeWrap2"><button class="btn btn-outline-secondary" type="button" id="closeSearch2">close</button></div>'
    document.querySelector("#postTab").innerHTML = `<span class="postTabMain" id="postsTitle"></span><span class="postTabMain" id="commentsTitle">`
    let userName = `<div id="userName">${user}</div>`
    fetch(`/get_profile/${user}`)
    .then(response => response.json())
    .then(profile => {
        let aboutInfo = profile.selfProfile != "" ? `<span id="aboutInfo" class="aboutInfo">${editPen}about</span>` : ""
        let about = `<div id="aboutUser" class="aboutUser lead">${profile.about ? profile.about : ""}</div>`
        let followButton = `<button id="${user}" class="btn btn-outline-info followsB followButton">follow</button>`
        let unfollowButton = `<button id="${user}" class="btn btn-outline-secondary followButton">unfollow</button>`
        let button = profile.followed ? unfollowButton : followButton
        let image = `<img class="profilePhoto" width=55 src="/static/network/profile.png"></img>`
        let joined = `<span class="joinedDate"><span id="calendar"></span> joined ${profile.joined.split(",")[0]}</span>`
        let followers = `<a id="followerLink" data-bs-toggle="collapse" href="#followerArea"  aria-expanded="false" aria-controls="followerArea"><span class='userCount'>${profile.followers}<span class=userFollow> followers</span></span></a>`
        let follows = `<a id="followLink" data-bs-toggle="collapse" href="#followArea"  aria-expanded="false" aria-controls="followArea"><span class='userCount'>${profile.follows}<span class=userFollow> follows</span></span></a>`
        header.innerHTML = `<div class="proHead">${image}${userName}</div><div class="proBottom"><div class="twoFollow">${followers}${follows}</div>${about}${joined}${profile.selfProfile == user || !profile.selfProfile ? aboutInfo : button}</div>`
        document.querySelector("#calendar").innerHTML = calendar
        if (profile.selfProfile != user && profile.selfProfile != "") {
            let theButton = document.querySelector(`.followButton`)
            theButton.onclick = () => follow(theButton.innerHTML, user);
        }
        if (document.querySelector("#aboutInfo")) {
            editAboutUser()
        }
        let closeBtn = document.createElement("div")
        closeBtn.innerHTML = `${closeButtonFollow}`
        document.querySelector("#followerLink").onclick = () => {
            $('.followArea').collapse("hide");
            getFollowList(user, document.querySelector("#listFw"), closeBtn)  
        }
        document.querySelector("#followLink").onclick = () => {
            $('.followerArea').collapse("hide");
            getFollowList(user, document.querySelector("#listF"), closeBtn)
        }
    })
    .then(() => {
        $("#profileHeader").fadeIn()
    })
    .then(() => {
        document.querySelector("#postsTitle").innerHTML = "Posts"
        document.querySelector("#commentsTitle").innerHTML = "Comments"
        let span = document.createElement("span")
        span.innerHTML = '<hr id="postTabBottom">'
        document.querySelector("#postTab").append(span)
    })
    .then(() => document.querySelectorAll(".postTabMain").forEach(item => togglePostTab(item.id, user)) )
}


function togglePostTab(id, user) {
    document.querySelector(`#${id}`).onclick = function () {
        if (id == "commentsTitle") {
            getPostHelper("profile", user, 1, "comment")
            history.pushState({section: `Cprofile-${user}`}, "", `profile`)
        } else if (id == "postsTitle") {
            getPostHelper("profile", user, 1, "post")
            history.pushState({section: `profile-${user}`}, "", `profile`)
        }
    }
}

function setLocals() {
    localStorage.setItem("allPost", 0)
    localStorage.setItem("following", 0)
    localStorage.setItem("profile", 0)
    localStorage.setItem("allPostOrder", 1)
    localStorage.setItem("followingOrder", 0)
    localStorage.setItem("profileOrder", 0)
}


function getPostHelper(profile, user, num, status) {
    if (status == "comment") {
        document.querySelector("#commentsTitle").style.textDecoration = "underline"
        document.querySelector("#commentsTitle").style.textDecorationThickness = "5px"
        document.querySelector("#commentsTitle").style.textDecorationColor = "#497070"
        document.querySelector("#commentsTitle").previousElementSibling.style.textDecoration = "none"
    } else if (status == "post") {
        document.querySelector("#postsTitle").style.textDecoration = "underline"
        document.querySelector("#postsTitle").style.textDecorationThickness = "5px"
        document.querySelector("#postsTitle").style.textDecorationColor = "#497070"
        document.querySelector("#postsTitle").nextElementSibling.style.textDecoration = "none"
    }
    removePagination() 
    document.querySelector("#all_posts").innerHTML = ""
    getPosts(profile, user, num, status)
}


function editAboutUser() {
    document.querySelector("#aboutInfo").onclick = function () {
        this.innerHTML = `<button id="saveInfo" class="btn btn-outline-secondary btn-sm">save</button>`
        let textArea = document.createElement("textarea")
        let remainChar = document.createElement("span")
        let info = document.querySelector("#aboutUser").innerHTML
        let charLength = info.length
        remainChar.innerHTML = `${charLength}/140`
        remainChar.className = "remainChar"
        textArea.className = "aboutTextEdit form-control shadow-none"
        textArea.setAttribute("maxlength", "140")
        textArea.autofocus = true
        textArea.innerHTML = info
        document.querySelector("#aboutUser").innerHTML = ""
        document.querySelector("#aboutUser").append(textArea)
        document.querySelector("#aboutUser").append(remainChar)
        document.querySelector("#aboutInfo").id = "saveAboutButton"
        textArea.oninput = function () {
            charLength = this.value.length
            remainChar.innerHTML = `${charLength}/140`
        } 
        saveAbout(textArea)
    }
}


function saveAbout(textArea) {
    document.querySelector("#saveAboutButton").onclick = function () {
        this.id = "aboutInfo"
        this.innerHTML = `${editPen}about`
        fetch(`/edit_about_user`, {
            method: 'PUT',
            body: JSON.stringify({
                content: textArea.value
            })
        })
        .then(response => response.json())
        .then(result => console.log(result))
        document.querySelector("#aboutUser").innerHTML = textArea.value
        editAboutUser()
    }
}


function getFollowList(user, results, closeBtn) {
    let page = arguments[3] ? arguments[3] : 1
    fetch(`/get_follow_results/${user}/${page}`)
    .then(response => response.json())
    .then(data => {
        let list = [data.followerList, data.followList]
        if (list[0].length == 0 && results == document.querySelector("#listFw")) {
            document.querySelector("#listFw").innerHTML = "<h5 class='noYet'>Empty</h5>"
            createCloseBtn(results, closeBtn)
            return false
        } else if (list[1].length == 0 && results == document.querySelector("#listF")){
            document.querySelector("#listF").innerHTML = "<h5 class='noYet'>Empty</h5>"
            createCloseBtn(results, closeBtn)
            return false
        }
        return list
    })
    .then(list => {
        if (list) {
            if (results == document.querySelector("#listFw")) {
                createFollowList(results, list[0], closeBtn, page, user)
            }  else if (results == document.querySelector("#listF")) {
                console.log(list[1])
                createFollowList(results, list[1], closeBtn, page, user)
            }
        }
    })
}


function createFollowList(results, list, button, page, user) {
    if (page == 1) {
        results.innerHTML = ""
    }
    for (let following of list) {
        createSearchResult(following, results)
    }
    if (list.length >= 30) {
        let moreIcon = createMoreIcon(results)
        moreIcon.onclick = () => {
            moreIcon.remove()
            getFollowList(user, results, button, parseInt(page)+1)
        }
    }
    createCloseBtn(results, button)
}


function createCloseBtn(results, closeBtn) {
    results.append(closeBtn)
    closeBtn.onclick = () => {
        $('.theFollowArea').collapse("hide");
    }
}


function getPersonIcon() {
    let span = document.createElement("span")
    span.innerHTML = `${roundedPerson}`
    return span
}


function createBr() {
    let br = document.createElement("div")
    br.innerHTML = "<br>"
    return br
}


function createPersonSpan(user) {
    let span = document.createElement("span")
    span.innerHTML = `${user}`
    span.className = "proResult"
    return span
}


function createSearchResult(user, results) {
    let personIcon = getPersonIcon()
    let personName = createPersonSpan(user)
    results.append(personIcon)
    results.append(personName)
    results.append(createBr())
    personName.onclick = () => {
        removePagination()
        getPage("profile", user)
        desktopS ? desktopS.setAttribute("data-bs-target", "#searchIcon2") : ""
        history.pushState({section: `profile-${user}`}, "", `profile`)
        $('.mobileSearchArea').collapse("hide");
        $('.desktopSearchArea').collapse("hide");
    }
}


function getUserSearch(value, page, results) {
    fetch(`/search/${value}/${page}`)
    .then(response => response.json())
    .then(data => {
        console.log(data)
        if (data.length == 0) {
            results.html("No result.")
        } else {
            $(results).hide()
            for (let user of data) {
                createSearchResult(user, results)
            }
            $(results).fadeIn()
        }
        if (data.length >= 10) {
            getMoreResultFunc(results, page, getUserSearch, value)
        }
        if (results.id == "searchResults2") {
            document.querySelector("#desktopS").setAttribute("data-bs-target", "")
            document.querySelector("#closeSearch").onclick = () => {
                document.querySelector("#desktopS").setAttribute("data-bs-target", "#searchIcon2")
            }
        }
    });
}


function createMoreIcon(results) {
    let moreResult = document.createElement("div")
    moreResult.className = "moreResult"
    moreResult.innerHTML = "More results..."
    results.append(moreResult)
    return moreResult
}


function getMoreResultFunc(results, page, func, value) {
    let moreResult = createMoreIcon(results)
    moreResult.onclick = () => {
        moreResult.remove()
        func(value, page + 1, results)
    }
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
    let type = arguments[1] ? arguments[1] : ""
    let order = arguments[2] ? arguments[2] : "otherThanFirst"
    if (type === "post") {
        return createPost(post)
    } else if (type === "comment") {
        return createCommentTree(post, order)
    }
}


function createCommentTree(post, order) {
    let div = document.createElement("div")
    let hr = document.createElement("hr")
    let postRoot = post.postRoot ? createPost(post.postRoot) : ""
    postRoot ? postRoot.classList.add("p" + postRoot.dataset.id) : ""
    postRoot ? postRoot.classList.add("postRoot") : ""
    let largeDots = document.createElement("div")
    let largeDotsPillow = document.createElement("div")
    let postMain = post.postMain ? createPost(post.postMain) : ""
    postMain ? postMain.classList.add("p" + postMain.dataset.id) : ""
    postMain ? postMain.classList.add("postMain") : ""
    let smallDots = document.createElement("div")
    let postComment = createPost(post.postComment)
    postComment ? postComment.classList.add("p" + postComment.dataset.id) : ""
    largeDots.className = "commentDots largeDots"
    smallDots.className = "commentDots smallDots"
    largeDotsPillow.className = "largePillow"
    let smallDotsPillow = largeDotsPillow.cloneNode(true)
    hr.className = "postGroupHr postGroupHr-top"
    order == "otherThanFirst" ? div.append(hr) : ""
    div.append(postRoot)
    postRoot ? postRoot.classList.add("tree") : ""
    postMain ? postMain.classList.add("tree") : ""
    postComment.classList.add("tree")
    smallDots.classList.add("tree")
    largeDots.classList.add("tree")
    largeDotsPillow.classList.add("tree")
    postRoot ? div.append(largeDots) : ""
    postRoot ? div.append(largeDotsPillow) : ""
    div.append(postMain)
    postComment.dataset.comment == "true" ? div.append(smallDots) : ""
    postComment.dataset.comment == "true" ? div.append(smallDotsPillow) : ""
    div.append(postComment)
    div.className = "commentTree"
    return div
}


function createPost(post) {
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
    div.setAttribute("data-opened", "close")
    div.className = `post form-group postItem border border-light`
    div.id = "post" + post.thePost.id
    return div
}


function getPosts() {
    return fetch(`/all_posts/${arguments[0]}-${arguments[1]}/${arguments[2]}/${arguments[3]}`)
    .then(response => response.json())
    .then(data => {
        if (data.posts.length == 0 && document.querySelector("#all_posts").innerHTML == "" ) {
            let noPost = document.createElement("h4")
            noPost.innerHTML = "No post yet!"
            noPost.className = 'noYet'
            document.querySelector("#all_posts").append(noPost)
        } else {
            getPostsList(data, arguments[2], arguments[3] ? arguments[3] : "", arguments[1], arguments[0], arguments[4] ? arguments[4]: "")
        }
    });
}


function getPostsList(data, page, type, profile, status, auto) {
    let postCount = document.querySelector("#all_posts").childNodes.length
    data.posts.forEach((post, index) => {
        var div;
        if (index == 0) {
            div = createPostItem(post, type, "first")
        } else {
            div = createPostItem(post, type)
        }
        let wrapperPost = document.createElement("div")
        div.setAttribute("data-order", `${postCount + parseInt(index) + 1}`)
        wrapperPost.append(div)
        document.querySelector("#all_posts").append(wrapperPost)
    });
    if (!auto)
    pagination(status, profile, page, type)
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
    commentForm.style.display = "none"
    commentForm.classList.add(`cf${post.dataset.id}`) 
}


function comment(post, icon, fast) {
    if (icon.innerHTML == "💬") {
        icon.innerHTML = "💬..."
        post.style.backgroundColor = "#82b2cf1a"
        var commentForm;
        if (header.dataset.profile != "AnonymousUser") {
            commentForm = document.querySelector(".send").cloneNode(true)
            createCommentForm(post, commentForm)
            commentForm.childNodes["7"].onclick = () => {
                if (!commentForm.childNodes["5"].value) {
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
                    removeCommentSections(icon, post, fast=true)
                    comment(post, icon, fast=true)
                });
                icon.nextElementSibling.innerHTML = parseInt(icon.nextElementSibling.innerHTML) + 1
                window.location.href = `#${post.dataset.id}`
            }
        } else if (header.dataset.profile == "AnonymousUser") {
            commentForm = document.createElement("div")
            commentPillow = `<div class="commentPillow"></div>`
            commentForm.innerHTML = `<div style="display: none;" class="loggin cf${post.dataset.id}">${commentPillow}<div class='loginWarn'><a class="lgtext" href='/login'>Login to write comment</a></div></div>`
        }
        let page = 1
        getComment(post, commentForm, page, fast=false)
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


function removeCommentSections(icon, post, fast=false) {
    icon.innerHTML = "💬"
    post.classList.add(`o${post.dataset.id}`)
    console.log(post)
    post.style.backgroundColor = "white"
    post.parentElement.style.paddingBottom = "0px"
    if (fast) {
        $(`.o${post.dataset.id}`).nextAll().remove()
    } else if (!fast) {
        $(`.o${post.dataset.id}`).nextAll().slideUp(200, function() {
            $(`.o${post.dataset.id}`).nextAll().remove()
        })
    }
}


function getComment(post, commentForm, page=1, loadMore=false, loadItem="", fast) {
    var wrapper;
    fetch(`/get_comment/${post.dataset.id}/${page}`)
    .then(response => response.json())
    .then(data => {
        for (let item of data.list) {
            commentItem = createPostItem(item, "post")
            wrapper = document.createElement("div")
            wrapper.className = `commentWrapper w${post.dataset.id}`
            commentItem.className = "post form-group postItem border border-light commentSection"
            wrapper.append(commentItem)
            post.parentElement.appendChild(wrapper)
            post.parentElement.style.paddingBottom = "30px"
            if (wrapper.offsetWidth <= window.innerWidth * 0.40) {
                wrapper.style.paddingLeft = "0%"
                wrapper.style.borderLeft = "none"
            }
            wrapper.style.display = "none"
        }
        return data
    })
    .then(data => {
        fast ? $(`.w${post.dataset.id}`).fadeIn() : $(`.w${post.dataset.id}`).fadeIn()
        return data
    })
    .then(data => {
        post.parentElement.append(commentForm)
        $(`.cf${post.dataset.id}`).slideDown(200)
        commentForm.childNodes["5"] ? giveRemainChar(commentForm.childNodes["5"]) : ""
        return data
    })
    .then(data => {
        if (data.hasNext) {
            let load = createLoadItem()
            load.innerHTML = "<h5 class='loadInfo'><i>load more comments</i><h5>"
            post.parentElement.appendChild(load)
            load.onclick = () => {
                getComment(post, commentForm, page + 1, loadMore=true, loadItem=load)
            }
        }
    })
    .then(() => {
        if(document.querySelector(`#p${post.dataset.id}`)) {
            document.querySelector(`#p${post.dataset.id}`).scrollIntoView()
            window.scrollBy(0, -35)
        }
    })
    .then(() => {
        if (loadMore) {
            loadItem.scrollIntoView()
            window.scrollBy(0, -100)
        }
    })
    .then(() => {
        if (loadMore) {
            loadItem.remove()
        }
    })
}


function pagination(status, profile, page, type) {
    window.addEventListener("scroll", pageLoad)

    $(window).click(function(event) {
        let icon = event.target
        if ([...icon.classList].includes("postItem") || [...icon.classList].includes("postContent") || icon.classList.contains("removeScroll") || icon.id == "followingM"
         || icon.className == "postOwner" || icon.className == "maker" || icon.id == "profile" || icon.id == "notification" || icon.id == "following" || icon.id == "strongProfile" 
         || icon.id ==  "notificationM" || icon.className == "proResult" || icon.className == "postTabMain" || icon.id == "allPosts" || icon.id == "allPostsM") {
            window.removeEventListener("scroll", pageLoad)
        }
    })
    window.addEventListener("popstate", () => window.removeEventListener("scroll", pageLoad))
    function pageLoad() {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
            getPosts(status, profile, page + 1, type)
            window.removeEventListener("scroll", pageLoad)
        } 
    }
}


function removePagination() {
    document.querySelector("#all_posts").innerHTML = ""
}



function deletePost(post)  { 
    !post.classList.contains("tree") ? post.parentElement.setAttribute("id", "toDelete") : post.setAttribute("id", "toDelete")
    post.parentElement.style.paddingBottom = "0px"
    document.querySelector("#alertConfirmDelete").click()
    let confirm = $("#deleteLastConfirm")
    $(confirm).click( () => {
        fetch(`/delete_post/${post.dataset.id}`)
        .then(response => response.json())
        .then(result => {
            console.log(result)
            if (result.success) {
                let topElement = post.parentElement.parentElement.firstElementChild
                topElement.classList.contains("postGroupHr") ? topElement = topElement.nextElementSibling : ""
                if (post.dataset.comment == "true" && !post.classList.contains("tree") && !topElement.classList.contains("tree")) {
                    let count = topElement.childNodes[8] ? topElement.childNodes[8].lastElementChild : ""
                    console.log(topElement, "hi")
                    count ? count.innerHTML = parseInt(count.innerHTML) - 1 : ""
                } else if (post.dataset.comment == "true" && !post.classList.contains("tree") && topElement.classList.contains("tree")) {
                    let sibling = post.parentElement.previousElementSibling
                    console.log(sibling)
                    while (!sibling.classList.contains("tree")) {
                        sibling = sibling.previousElementSibling
                    }
                    sibling.childNodes[8].lastElementChild.innerHTML = parseInt(sibling.childNodes[8].lastElementChild.innerHTML) - 1
                }

                if (post.classList.contains("tree")) {
                    post.previousElementSibling ? $(`.p${post.dataset.id}`).prev().slideUp(500).remove(): ""
                    post.previousElementSibling ? $(`.p${post.dataset.id}`).prev().slideUp(500).remove() : ""
                    
                    let id = post.previousElementSibling ? "p" + post.previousElementSibling.dataset.id : ""
                    console.log(post.previousElementSibling)
                    if (id) {
                        if  (document.querySelector(`.${id}`)) {
                            document.querySelectorAll(`.${id}`).forEach(item => {
                                item.childNodes[8].lastElementChild.innerHTML = parseInt(item.childNodes[8].lastElementChild.innerHTML) - 1
                            })
                        }
                    }
                    while (post.nextElementSibling) {
                        $(`.p${post.dataset.id}`).next().slideUp(300).remove()
                    }
                }
                let idNo = "p" + post.dataset.id
                if  (document.querySelector(`.${idNo}`)) {
                    document.querySelectorAll(`.${idNo}`).forEach(item => {
                        while (item.nextElementSibling) {
                            item.nextElementSibling.remove()
                        }
                        $(`.p${post.dataset.id}`).slideUp(300);
                    });
                }
                if (post) {
                    $(`#toDelete`).slideUp(300, function() {
                        $(`#toDelete`).remove()
                    })
                }
            }
        })
    })
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
    while (text.value.includes("<br>")) {
        text.value = text.value.replace("<br>", "\n");
    };
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
            button.parentElement.childNodes[4].innerHTML = text.value
            button.parentElement.childNodes[2].innerHTML = ""
            button.parentElement.childNodes[2].append(edited)
            button.style.display = "inline-block"
            saveButton.style.display = "none"
        });
    }
}


function getPage() {
    document.querySelector("#all_posts").innerHTML = ""
    document.querySelector("#postTab").innerHTML = ""
    document.querySelector("#followResultArea").innerHTML = ""
    header.style.display = "none"
    let form = document.querySelector("#new_post_area")
    let title = document.querySelector("#title")
    if (arguments[0] == "all_posts") {
        title.innerHTML = "All Posts"
    } else if (arguments[0] == "following") {
        title.innerHTML = "From Your Followings<hr>"
    } else if (arguments[0] == "profile") {
        title.innerHTML = "<span></span>"
        getProfile(arguments[1])
    } else if (arguments[0] == "notification") {
        title.innerHTML = "Notifications:<hr>"
        getNotifications()
    } else if (arguments[0].slice(0,4) == "post") {
        title.innerHTML = ""
        getThePost(arguments[0].slice(4))
    }
    arguments[0] == "all_posts" && following ? $(form).fadeIn(180) : form.style.display = "none"
    if (arguments[0] != "notification" && arguments[0].slice(0,4) != "post") {
        let pageNum = arguments[2] ? arguments[2] : 1
        return getPosts(arguments[0], arguments[1], pageNum, "post")
    }
}


function getThePost() {
    cleanPage()
    fetch(`/get_post/${arguments[0]}`)
    .then(response => response.json())
    .then(post => {
        let div = createPostItem(post, "comment")
        document.querySelector("#all_posts").append(div)
        div.lastElementChild.setAttribute("data-opened", "opened")
        div.lastElementChild.id = "p" + arguments[0]
        comment(div.lastElementChild, div.lastElementChild.childNodes[8].firstElementChild)
    })  
}


function cleanPage() {
    $("#all_posts").html("")
    $("#new_post_area").hide()
    $("#title").html("")
    $("#profileHeader").hide()
    $("#postTab").html("")
}

function cleanPagePart() {
    $("#new_post_area").hide()
    $("#title").html("")
    $("#all_posts").html("")
}



function getNotifications() {
    let page = arguments[0] ? arguments[0] : 1
    var count = arguments[1] ? arguments[1] : parseInt(document.querySelector("#amount").innerHTML);
    console.log(document.querySelector("#notificationM"), "this is nottM")
    amount =  count - (page - 1) * 30
    let notWrapper = document.createElement("div")
    $("#notCount").hide()
    $("#notCountM").hide()
    $("#notIcon").attr("fill", "#022c5570")
    $("#notIconM").attr("fill", "#022c5570")
    fetch(`/get_notifications/${page}`)
    .then(response => response.json())
    .then(data => {
        let the_person = person
        data.notList.forEach((notification, index) => {
            let notItem = document.createElement("div")
            notItem.className = "border border-left-0 border-top-0 border-right-0 border-info notItem"
            notItem.setAttribute("data-content", notification.content_id)
            notItem.setAttribute("data-main", notification.main_id)
            notItem.setAttribute("data-type", notification.type)
            let time = `<span class="notTime">${notification.time}</span>`
            if (notification.type == "follow") {
                notItem.innerHTML = `<div class="topNot">${the_person} ${time}</div><span class="notBody"><span class="maker">${notification.maker}</span></span> follows you `
            } else if (notification.type == "like") {
                notItem.innerHTML = `<div class="topNot">${heart}${time}</div><span class="notBody"> <span class="maker">${notification.maker}</span></span> liked your post: ${getRepr(notification, "content")}`
            } else if (notification.type == "reply") {
                notItem.innerHTML = `<div class="topNot">${chat}${time}</div><span class="notBody"> <span class="maker">${notification.maker}</span></span> replied: ${getRepr(notification, "content")} to your post ${getRepr(notification, "reply_to")}`
            }
            notItem.style.backgroundColor =  index + 1 <= amount ?  "white" : "rgb(152 177 201 / 17%)"
            notWrapper.append(notItem)  
        })
        document.querySelector("#all_posts").append(notWrapper)
        return data
    })
    .then(data => {
        data.notList.length == 0 ? document.querySelector("#all_posts").innerHTML = "<h4 class='noYet'>No notifications yet.</h4>" : ""
        return data
    })
    .then(data => {
        fetch("read_notifications")
        .then(response => response.json())
        .then(result => console.log(result.success))
        return data
    })
    .then((data) => {
        if (data.notifications.length > 30 && data.notList.length == 30) {
            let load = createLoadItem()
            load.innerHTML = "<h5 class='loadInfo notLoad'><i>load more</i><h5>"
            notWrapper.appendChild(load)
            load.onclick = () => {
                load.remove()
                getNotifications(page + 1, count)
            }
        }
    })
    .then(() => {
        document.querySelector("#amount").innerHTML = 0
    })
}


function createLoadItem() {
    let load = document.createElement("div")
    load.style.width = "240px"
    load.style.paddingLeft = "2.5%" 
    return load
}


function getRepr(notification, content) {
    let contentRepr = notification[content].length > 10 ? notification[content].slice(0, 16) + "..." : notification[content]
    return `<span class="contentRepr"><i class="toOpenPost">\"${contentRepr}\"</i></span>`
}


function textCorrection(element) {
    while (element.value.includes("\n")) {
        element.value = element.value.replace("\n", "<br>");
    };
};


$(window).click(function(event) {
    let title = document.querySelector("#title")
    let icon = event.target
    let likes = icon.nextElementSibling
    console.log(icon)    
    if (icon.classList[0] == "heartIcon") {
        if (header.dataset.profile == "AnonymousUser") {
            window.location.href = `/login`
        }
        if (icon.innerHTML == "🤍" && icon.classList.contains("heartIcon") && $(header).data("profile") != "AnonymousUser") {
            let idNo = "p" + icon.dataset.id
            if  (document.querySelector(`.${idNo}`)) {
                document.querySelectorAll(`.${idNo}`).forEach(item => {
                    item.childNodes[6].innerHTML = "❤";
                    item.childNodes[7].innerHTML = parseInt(item.childNodes[7].innerHTML) + 1;
                });
            } else {
                icon.innerHTML = "❤";
                likes.innerHTML = parseInt(likes.innerHTML) + 1;
            }
            fetch(`/like_post/${icon.dataset.id}`)
            .then(response => response.json())
            .then(result => {        
                if (result.success) {
                    console.log(result)
                } else {
                    icon.innerHTML = "🤍"
                    likes.innerHTML = parseInt(likes.innerHTML) - 1
                }
            });
        } else if (icon.innerHTML == "❤" && icon.classList.contains("heartIcon")) {
            let idNo = "p" + icon.dataset.id
            if  (document.querySelector(`.${idNo}`)) {
                document.querySelectorAll(`.${idNo}`).forEach(item => {
                    item.childNodes[6].innerHTML = "🤍";
                    item.childNodes[7].innerHTML = parseInt(item.childNodes[7].innerHTML) - 1;
                });
            } else {
                icon.innerHTML = "🤍";
                likes.innerHTML = parseInt(likes.innerHTML) - 1;
            }
            fetch(`/unlike_post/${icon.dataset.id}`)
            .then(response => response.json())
            .then(result => {
                
                if (result.success) {
                    console.log(result)
                } else {
                    icon.innerHTML = "❤"
                    likes.innerHTML = parseInt(likes.innerHTML) + 1;
                }
            });
        }
    } else if (icon.className == "postOwner" || icon.className == "maker") {
        $('.collapse').collapse("hide");
        desktopS ? desktopS.setAttribute("data-bs-target", "#searchIcon2") : ""
        removePagination()
        getPage("profile", icon.innerHTML)
        history.pushState({section: `profile-${icon.innerHTML}`}, "", `profile`)
    } else if (icon.className == "commentIcon" && !icon.parentElement.parentElement.classList.contains("postMain") && !icon.parentElement.parentElement.classList.contains("postRoot")) {
        if (event.persisted) {
            window.location.reload(); 
        }
        comment(icon.parentElement.parentElement, icon)
    } else if ([...icon.classList].includes("postItem")) {
        var refac = ""
        if (icon.dataset.comment == "true" && title.innerHTML && ![...icon.classList].includes("tree")) {
            refac = icon.parentElement
            function getRoot(refac) {
                while (!refac.dataset.comment) {
                    refac = refac.previousElementSibling
                }
                return refac
            }
            while (getRoot(refac).dataset.comment == "true") {
                refac = getRoot(refac.parentElement)
            }
            refac = getRoot(refac)
        }
        if (icon.dataset.opened == "close") {
            desktopS ? desktopS.setAttribute("data-bs-target", "#searchIcon2") : ""
            $('.collapse').collapse("hide");
            if (title.innerHTML == "All Posts") {
                if (refac) {
                    localStorage.setItem("allPost", refac.id)
                    localStorage.setItem("allPostOrder", refac.dataset.order) 
                } else {
                    localStorage.setItem("allPost", icon.id)
                    localStorage.setItem("allPostOrder", icon.dataset.order) 
                }  
            } else if (title.innerHTML == "From Your Followings<hr>") {
                if (refac) {
                    localStorage.setItem("following", refac.id)
                    localStorage.setItem("followingOrder", refac.dataset.order) 
                } else {
                    localStorage.setItem("following", icon.id)
                    localStorage.setItem("followingOrder", icon.dataset.order) 
                }  
            } else if (title.innerHTML == "<span></span>") {
                if (refac) {
                    localStorage.setItem("profile", !icon.classList.contains("tree") ? refac.id : 0)
                    localStorage.setItem("profileOrder", !icon.classList.contains("tree") ? refac.dataset.order : 0) 
                } else {
                    localStorage.setItem("profile", !icon.classList.contains("tree") ? icon.id : 0)
                    localStorage.setItem("profileOrder", !icon.classList.contains("tree") ? icon.dataset.order : 0) 
                }  
            }
            getThePost(icon.dataset.id)
            history.pushState({section: `post${icon.dataset.id}`}, "", `post`)
        }
    } else if ([...icon.classList].includes("postContent")) {
        var refac = ""
        if (icon.parentElement.dataset.comment == "true" && title.innerHTML && ![...icon.parentElement.classList].includes("tree")) {
            refac = icon.parentElement.parentElement
            function getRoot(refac) {
                while (!refac.dataset.comment) {
                    refac = refac.previousElementSibling
                }
                return refac
            }
            while (getRoot(refac).dataset.comment == "true") {
                refac = getRoot(refac.parentElement)
            }
            refac = getRoot(refac)
        }
        if (icon.parentElement.dataset.opened == "close") {
            desktopS ? desktopS.setAttribute("data-bs-target", "#searchIcon2") : ""
            $('.collapse').collapse("hide");
            if (title.innerHTML == "All Posts") {
                if (refac) {
                    localStorage.setItem("allPost", refac.id)
                    localStorage.setItem("allPostOrder", refac.dataset.order) 
                } else {
                    localStorage.setItem("allPost", icon.parentElement.id)
                    localStorage.setItem("allPostOrder", icon.parentElement.dataset.order) 
                }  
            } else if (title.innerHTML == "From Your Followings<hr>") {
                if (refac) {
                    localStorage.setItem("following", refac.id)
                    localStorage.setItem("followingOrder", refac.dataset.order) 
                } else {
                    localStorage.setItem("following", icon.parentElement.id)
                    localStorage.setItem("followingOrder", icon.parentElement.dataset.order) 
                }  
            } else if (title.innerHTML == "<span></span>") {
                if (refac) {
                    localStorage.setItem("profile", !icon.parentElement.classList.contains("tree") ? refac.id : 0)
                    localStorage.setItem("profileOrder", !icon.parentElement.classList.contains("tree") ? refac.dataset.order : 0) 
                } else {
                    localStorage.setItem("profile", !icon.parentElement.classList.contains("tree") ? icon.parentElement.id : 0)
                    localStorage.setItem("profileOrder", !icon.parentElement.classList.contains("tree") ? icon.parentElement.dataset.order : 0) 
                }  
            }
            getThePost(icon.parentElement.dataset.id)
            history.pushState({section: `post${icon.parentElement.dataset.id}`}, "", `post`)
        }
    } else if ((icon.className == "toOpenPost" && icon.parentElement.parentElement.dataset.type == "reply") || icon.dataset.type == "reply") {
        if (icon.parentElement.parentElement.dataset.type == "reply") {
            let postId = icon.parentElement.parentElement.dataset.content
            getThePost(postId)  
            history.pushState({section: `post${postId}`}, "", `post`)
        } else if (icon.dataset.type == "reply") {
            getThePost(icon.dataset.content)
            history.pushState({section: `post${icon.dataset.content}`}, "", `post`)
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
    } else if (icon.parentElement.parentElement.classList.contains("postMain") || icon.parentElement.parentElement.classList.contains("postRoot")) {
        $('.collapse').collapse("hide");
        getThePost(icon.parentElement.parentElement.dataset.id)
        history.pushState({section: `post${icon.parentElement.parentElement.dataset.id}`}, "", `post`)
    }
});   



