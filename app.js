//load enviorment variables
require('dotenv').config()


//require everything
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const User = require("./models/user")
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const cookieparser = require("cookie-parser");
const path = require("path");
const JWT_SECRET = process.env.SECRET;

//middlewares
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieparser());
app.use(express.static(path.join(__dirname, 'public')));



mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
})
app.listen(3000);


app.get("/", (req, res) => {
    res.render("signup");
})

app.get('/login', (req, res) => {
    res.render("login");
})

app.get('/logout', (req, res) => {
    res.clearCookie("jwt");
    res.redirect("/login")
})

//protected route
app.get("/protected", (req, res) => {

    let user_token;
    if (req.cookies.jwt) {
        user_token = req.cookies.jwt;
    }
    try {
        const user = jwt.verify(user_token, `${JWT_SECRET}`);
    } catch (error) {
        return res.redirect("/login");
    }
    return res.render("protected")
})




//login
app.post("/login", async (req, res) => {
    const { emailvalue: email, passvalue: password } = req.body;

    const user = await User.findOne({ email }).lean()


    if (!user) {
        return res.json({ status: "error", message: "Email ID not found", type: "email" })
    }

    if (await bcrypt.compare(password, user.password)) {
        const token = jwt.sign(
            {
                id: user._id,
                username: user.username
            },
            `${JWT_SECRET}`
        );
        res.cookie("jwt", token)
        return res.json({ status: "ok", data: token })
    }

    return res.json({ status: "error", message: "Password Incorrect", type: "password" })
})




//signup
app.post("/signup", async (req, res) => {

    const { username, email, password: plaintextpassword, confPass } = req.body;



    //validation
    if (!username || typeof username !== 'string') {
        return res.json({ status: "error", message: "Enter valid username", type: "username" })
    }
    if (!plaintextpassword || typeof plaintextpassword !== 'string') {
        return res.json({ status: "error", message: "Enter valid password", type: "password" })
    }
    let reg = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,10}$/;
    let regpass = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#$@!%&*?])[A-Za-z\d#$@!%&*?]{8,30}$/;
    const usernamequery = { "username": username };
    const emailquery = { "email": email }

    //email validation
    if (!reg.test(email)) {
        return res.json({ status: "error", message: "Enter valid emailID", type: "email" })
    }
    //password length validation
    if (plaintextpassword.length < 8 || plaintextpassword.length < 8) {
        return res.json({ status: "error", message: "Password should have minimum 8 characters and maximum 10 characters", type: "password" })
    }
    //password validation
    if (regpass.test(plaintextpassword) === false) {
        return res.json({ status: "error", message: "Password should contain atleast one uppercase letter, one lowercase letter, one number and one special character", type: "password" })
    }
    //username validation
    if (username.length < 6) {
        return res.json({ status: "error", message: "Username should be atleast 6 characters", type: "username" })
    }
    if (plaintextpassword !== confPass) {
        return res.json({ status: "error", message: "Password fields do not match", type: "notsamepassword" })

    }


    //username duplicate check
    const user = await User.findOne(usernamequery);
    if (user) {
        return res.json({ status: "error", message: "Username already in use", type: "username" })
    }

    //email duplicate check
    const useremail = await User.findOne(emailquery);
    if (useremail) {
        return res.json({ status: "error", message: "Email already in use", type: "email" })
    }

    //hash password
    const password = await bcrypt.hash(plaintextpassword, 10);

    try {
        const response = await User.create({
            username,
            password,
            email
        })
        return res.json({ status: "ok", redirected: "true", data: "rjbhbi" })

    } catch (error) {

        if (error.code === 11000) {
            return res.json({ status: "error", message: "Username already in use", type: "username" })
        }
        return res.json({ status: error })

    }



})