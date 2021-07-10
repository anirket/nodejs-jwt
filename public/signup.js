const signupForm = document.querySelector('.form');
const username = document.querySelector('#name');
const email = document.querySelector('#email');
const pass = document.querySelector('#pass');
const confirmpass = document.querySelector('#confirmpass');
const usernamefield = document.querySelector(".username-field");
const username_error = document.querySelector(".username-error");
const emailfield = document.querySelector(".email-field");
const email_error = document.querySelector(".email-error");

const passfield = document.querySelector(".password-field");
const passerror = document.querySelector(".pass-error");

const confpassfield = document.querySelector(".confpassword-field");
const confpasserror = document.querySelector(".confpass-error");

signupForm.addEventListener('submit', (e) => {
  e.preventDefault();
  console.log(username.value);
  fetch('/signup', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: username.value,
      email: email.value,
      password: pass.value,
      confPass: confirmpass.value,
    }),
  })
  .then((res)=>{
    return res.json();
  })
  .then((res)=>{
    console.log(res);
    if(res.status === "ok"){
      console.log("here");
      window.location.href = "/login"
    }
    if(res.status === "error"){


      //clear all previous errors
      usernamefield.style.border = "none";
      emailfield.style.border = "none";
      confpassfield.style.border = "none";
      passfield.style.border = "none";
      username_error.innerHTML="";
      email_error.innerHTML="";
      confpasserror.innerHTML="";
      passerror.innerHTML="";



      console.log("here1");

      //username error
      if(res.type === "username"){
        console.log("here");
        usernamefield.style.border = "4px solid red";
        username_error.innerHTML = `${res.message}`
      }
      if(res.type === "email"){
        emailfield.style.border = "4px solid red";
        email_error.innerHTML = `${res.message}`
      }
      if(res.type ==="notsamepassword"){
        confpassfield.style.border = "4px solid red";
        passfield.style.border = "4px solid red";
        confpasserror.innerHTML = `${res.message}`
      }
      if(res.type === "password"){
        passfield.style.border = "4px solid red";
        passerror.innerHTML = `${res.message}`
      }


    }

  })
});
