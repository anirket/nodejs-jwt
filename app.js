//load enviorment variables
require('dotenv').config()


//require everything
const express = require("express");
const app = express();
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const cookieparser = require("cookie-parser");
const JWT_SECRET = process.env.SECRET;
const studentdata = require('./Studentdata')
const admindata = require('./Admindata')
const cors = require('cors');
const fs = require('fs');

//middlewares
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieparser());
app.use(cors());

app.listen(process.env.PORT || 4000);
const circulardata = require('./Circular.json')


let past_circular = [...circulardata.circular];


app.get("/", (req, res) => {
    res.send("SERVER RUNNING SUCCESFULLY");
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


app.get('/getcirculars', (req, res) => {


    res.json(past_circular);
})
app.get('/getstudents', (req, res) => {
    const circulardata = require('./Studentdata.json')
    console.log(circulardata)
    const circular = circulardata.student_data;
    res.json(circular);
})

app.post('/postcircular', (req, res) => {

    const { message } = req.body;

    const circulardata = require('./Circular.json')

    const circular = circulardata.circular;

    past_circular = [...past_circular, { message }]



    const newmessage = [...circular, {
        message
    }]

    fs.writeFile('./Circular.json', JSON.stringify({ "circular": newmessage }, null, 2), () => {
        return res.json({ status: "ok", redirected: "true", data: "rjbhbi" })
    });

})



//login
app.post("/studentlogin", async (req, res) => {
    const { USN, password } = req.body;

    // const user = await User.findOne({ email }).lean()
    //search for user
    console.log(req.body)
    let user = undefined;


    studentdata.student_data.map((student) => {
        // console.log('HELLO',student, USN)
        if (Number(student.usn) === Number(USN)) {
            user = student
        }
    })

    console.log(user);


    if (!user) {
        return res.json({ status: "error", error: "Wrong credentials" })
    }

    if (await bcrypt.compare(password.toString(), user.pass.toString())) {
        const token = jwt.sign(
            {
                id: user._id,
                username: user.username
            },
            `${JWT_SECRET}`
        );
        return res.json({ status: "ok", data: token })
    }

    return res.json({ status: "error", error: "Wrong credentials", type: "password" })
})

app.post("/adminlogin", async (req, res) => {
    const { id, password } = req.body;

    // const user = await User.findOne({ email }).lean()
    //search for user
    console.log('helo', req.body)
    let user = undefined;


    admindata.admin_data.map((admin) => {
        // console.log('HELLO',student, USN)
        if (admin.id === id) {
            user = admin
        }
    })

    console.log(user);


    if (!user) {
        return res.json({ status: "error", error: "Wrong credentials" })
    }

    if (password.toString() == user.pass.toString()) {
        const token = jwt.sign(
            {
                id: user.id,
            },
            `${JWT_SECRET}`
        );
        return res.json({ status: "ok", data: token })
    }

    return res.json({ status: "error", error: "Wrong credentials", type: "password" })
})



//signup
app.post("/studentregister", async (req, res) => {

    const { usn, password } = req.body;
    console.log("here")

    // const response = await User.create({
    //     username,
    //     password,
    //     email
    // })
    // -- add user is JSON file

    const existinguser = studentdata.student_data;
    let useralready_exists = false;

    existinguser.map((student) => {
        if (student.usn === usn) {
            useralready_exists = true;
        }
    })

    if (useralready_exists) {
        console.log("here")
        return res.json({ error: "user already exists Please Login" })
    }

    const encryptedpassword = await bcrypt.hash(password, 10);


    const newstudent = [...existinguser, {
        usn,
        pass: encryptedpassword
    }]
    console.log('ee', newstudent)

    fs.writeFile('./Studentdata.json', JSON.stringify({ "student_data": newstudent }, null, 2), () => {
        return res.json({ status: "ok", redirected: "true", data: "rjbhbi" })
    });
    res.json({ error: "Something went wrong! Please try again" })
})