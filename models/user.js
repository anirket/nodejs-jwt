const mongoose = require("mongoose");

const Userschema = new mongoose.Schema({
    username : {
        type:String,
        required:true,
        unique:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    }
})

const model = mongoose.model('Userschema',Userschema);

module.exports = model;