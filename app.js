require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const config = require('./models/config');
const cookieParser = require('cookie-parser');
const userModal = require("./models/userModel")
const bcrypt = require('bcryptjs');
const auth = require("./middleware/auth");
const path = require('path');

const port = process.env.PORT || 8000;

const staticPath = path.join(__dirname, "./public");

app.use(cookieParser());
app.use(express.static(staticPath));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

//only for understanding purpose
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

app.get("/collegesignup", (req, res) => {

    res.render("CollegeSignUp");
})

app.get("/verified", auth, (req, res) => {

    res.render("verifiedPage");
});

app.get("/logout", auth, async (req, res) => {

    try {
        // console.log(req.user);

        req.user.tokens = req.user.tokens.filter((currentELe) => {
            return currentELe.token != req.token;
        })

        res.clearCookie("jwt")
        console.log("logout Successfully");
        await req.user.save();
        res.redirect("/");
    } catch (err) {
        res.status(401).send(err);
    }
})
app.get("/logoutAll", auth, async (req, res) => {

    try {
        // we are alligning empty array
        req.user.tokens = [];

        res.clearCookie("jwt")
        console.log("logout Successfully");
        await req.user.save();
        res.redirect("/");
    } catch (err) {
        res.status(401).send(err);
    }
})


app.post("/collegelogin", async (req, res) => {

    const Username = req.body.loginId;
    const password = req.body.password;

    const foundData = await userModal.findOne({ username: Username });

    if (foundData) {
        const isMatch = await bcrypt.compare(password, foundData.password);   // its retutrn boolean

        const token = await foundData.generateAuthToken();

        res.cookie("jwt", token, { maxAge: 10 * 60 * 1000, httpOnly: true });  // 10min

        // console.log(req.cookies.userToken);

        if (isMatch) {
            res.render('secret');
        } else {
            console.log("Incorrect Password");
            res.redirect("/");
        }
    } else {
        console.log("user not exists..");
    }

})

app.post("/collegesignup", async (req, res) => {

    const newUsername = req.body.username;
    const newPassword = req.body.password;

    const newUser = new userModal({
        username: newUsername,
        password: newPassword
    })

    const token = await newUser.generateAuthToken();

    // The res.cookies function is used to set the cookie name to value
    // The value parameter may bay be a string or object converted to JSON 

    res.cookie("jwt", token, { expires: new Date(Date.now() + 60000), httpOnly: true }); // 60sec

    // console.log(req.cookies.userToken);

    await newUser.save()
        .then(() => {
            console.log("Successfully added........");
        }).catch((err) => {
            console.log(err);
            res.redirect("/collegesignup");
        })
    res.render('secret');
})

//only for understanding purpose
// const createToken = async () => {
//     const token = await jwt.sign({ __id: "644cc12646bd3e97a3d87023" }, "your.secret.keys.", {
//         expiresIn: "2 seconds"
//     });
//     console.log(token);

//     const userVerify = await jwt.verify(token, "your.secret.keys.");
//     console.log(userVerify);
// }
// createToken();


app.listen(port, () => {
    console.log(`we are listening at port number ${port}`);
})