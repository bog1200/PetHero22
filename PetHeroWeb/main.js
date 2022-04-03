(async () => {
    if (!sessionStorage.getItem("token")) window.location.href = "/login.html";
async function webRequest(method, url, body){
  const headers = new Headers();
  headers.append('content-type', 'application/json');  
  const init = {
    method,
    headers,
    body
  };
  const response = await fetch(url, init)
const data = await response.json();
return data;
  
}
const newpostdiv = document.createElement('div');
newpostdiv.className = "row m-5";
newpostdiv.innerHTML = `
<form id="post-form" class="form-group" method="POST" action="/api/posts/new">
    <label for="post-title">Title</label>
    <input type="text" class="form-control" id="post-title">
    <label for="post-body">Body</label>
    <textarea class="form-control" id="post-body"></textarea>
    <label for="file">Attachment</label>
    <input type="file" class="form-control-file" id="file">
    <button type="submit" class="btn btn-primary">Submit</button>
  </form>`
  document.getElementById('new-posts-container').appendChild(newpostdiv);
 let data = await webRequest('POST', 'https://pethero22.romail.app/api/posts/getall',`{"token":"${sessionStorage.getItem("token")}"}`);
    for(let post of data){

    const postdiv = document.createElement('div');
    postdiv.className = "row post m-5";
    postdiv.innerHTML = `
    <h2>${post.title}</h2>
    <p>${post.content}</p>
    <img class="pb-3" src="http://cdn.akc.org/content/article-body-image/samoyed_puppy_dog_pictures.jpg" alt="">
    `
    if (post.userid == sessionStorage.getItem("userid"))
      postdiv.innerHTML+=` <form class="delete-form p-3" method="POST" action="/api/posts/delete">
        <input type="hidden" name="postid" value="${post.postid}">
        <input type="hidden" name="userid" value="${post.userid}">
        <input class="p-3 btn btn-danger" type="submit" value="Delete Post">
        </form>`; 
    else postdiv.innerHTML+=`<form class="message-form" method="POST" action="/messages/new">
      <input type="hidden" name="postid" value="${post.postid}">
      <input type="hidden" name="userid" value="${post.userid}">
      <input class="p-3 btn btn-primary" type="submit" value="Send Message">
</form>`;
   
    document.getElementById('posts-container').appendChild(postdiv);

// if('serviceWorker' in navigator) {
//     navigator.serviceWorker
//              .register('/sw.js')
//              .then(function() { console.log("Service Worker Registered"); });
//   }
}})();
