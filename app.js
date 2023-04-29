// require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
// const passport = require('passport');
// const session = require('express-session');
// const passportLocalMongoose = require('passport-local-mongoose');
// const LocalStrategy = require('passport-local').Strategy;
const path = require('path');
const port = 8000;

mongoose.set('strictQuery', true);
mongoose.connect("mongodb://127.0.0.1:27017/ajay")
    .then(() => {
        console.log("connected.......");
    }).catch((err) => {
        console.log(err);
    })


const staticPath = path.join(__dirname, "./public");
// console.log(staticPath);

app.use(express.static(staticPath));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));


const userSchema = mongoose.Schema({
    username: String,
    password: String
});

userSchema.pre("save", async function (next) {

    if (this.isModified("password")) {
        // console.log(this.password);
        this.password = await bcrypt.hash(this.password, 10);
        // console.log(this.password);
    }
    next();

})

const userModal = mongoose.model("userLogin", userSchema);

// const securePass = async function (password) {

//     // encrypt the password
//     const EncPssword = await bcrypt.hash(password, 10);
//     console.log(EncPssword);

//     // decrypt and compare the password
//     const DecPssword = await bcrypt.compare(password, EncPssword);

//     console.log(DecPssword);
// }

// securePass("Ajay");



app.get("/", (req, res) => {
    res.render("CollegeLogin");
});

app.get("/collegesignup", async (req, res) => {

    res.render("CollegeSignUp");
})

app.post("/collegelogin", async (req, res) => {

    const Username = req.body.loginId;
    const password = req.body.password;

    const foundData = await userModal.findOne({ username: Username });

    const isMatch = await bcrypt.compare(password, foundData.password);   // its retutrn boolean
    if (isMatch) {
        res.render('secret');
    } else {
        console.log("Incorrect Password");
        res.redirect("/");
    }

})

const saltRound = 10;
app.post("/collegesignup", async (req, res) => {

    const newUsername = req.body.username;
    const newPassword = req.body.password;

    const newUser = new userModal({
        username: newUsername,
        password: newPassword
    })

    await newUser.save()
        .then(() => {
            console.log("Successfully added........");
        }).catch((err) => {
            console.log(err);
            res.redirect("/collegesignup");
        })
    res.render('secret');
})



app.listen(port, () => {
    console.log(`we are listening at port number ${port}`);
})