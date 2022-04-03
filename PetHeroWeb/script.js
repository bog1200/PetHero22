(async () => {
    const headers = new Headers();
headers.append('content-type', 'application/json');

const body = `{"token":"3b82fc62-ef8e-4200-8743-67be7f34791a"}`;

const init = {
  method: 'POST',
  headers,
  body
};

const response = await fetch('https://pethero22.romail.app/api/posts/getall', init)
const data = await response.json();
    for(let post of data){
    const postdiv = document.createElement('div');
    postdiv.className = "row post m-5";
    postdiv.innerHTML = `
    <h2>${post.title}</h2>
    <p>${post.content}</p>
    <img class="pb-3" src="https://www.w3schools.com/howto/img_avatar.png" alt="">`;
    document.getElementById('posts-container').appendChild(postdiv);
}
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register("./service_worker.js");
 }
})();
