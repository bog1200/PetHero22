async function login (){
  const headers = new Headers();
  headers.append('content-type', 'application/json');

const body = `{"email": "${document.getElementById("email").value}", "password": "${document.getElementById("password").value}"}`;

const init = {
method: 'POST',
headers,
body
};

const response = await fetch('https://pethero22.romail.app/api/users/login', init)
const data = await response.json();
  if(data.token){
    sessionStorage.setItem("token", data.token);
    sessionStorage.setItem('userid', data.userid);
    window.location.href = "/";
}
else{
  alert("Invalid email or password");
}
}
