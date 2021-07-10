const loginForm = document.querySelector('.form');
const loginEmail = document.querySelector('#login-email');
const loginPass = document.querySelector('#login-pass');

const email_login_field = document.querySelector(".email-login-field")
const email_login_error = document.querySelector(".email-login-error");

const password_login_field = document.querySelector(".password-login-field");
const password_login_error = document.querySelector(".password-login-error");

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  console.log(loginPass.value);
  fetch('/login', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      emailvalue: loginEmail.value,
      passvalue: loginPass.value,
    })

  })
  .then((res)=>{
    return res.json();
  })
  .then((res)=>{
    console.log(res);

    if(res.status === "ok"){
      window.location.href = "/protected"
    }

    if(res.status === "error"){
      //clear all previous errors
      email_login_field.style.border = "none";
      password_login_field.style.border = "none"
      email_login_error.innerHTML = "";
      password_login_error.innerHTML = "";






      if(res.type === "email"){
        email_login_field.style.border = "4px solid red";
        email_login_error.innerHTML = `${res.message}`
      }
      if(res.type === "password"){
        password_login_field.style.border = "4px solid red";
        password_login_error.innerHTML = `${res.message}`
      }

    }
  })
});
