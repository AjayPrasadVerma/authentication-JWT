const jwt = require('jsonwebtoken');
const userModal = require("../models/userModel");

const auth = async (req, res, next) => {
    try {

        const token = req.cookies.jwt;
        const verifyUser = await jwt.verify(token, process.env.SECRET_KEY);
        // console.log(verifyUser);

        // to get the data from database
        const findUser = await userModal.findOne({ _id: verifyUser._id });
        // console.log(findUser.username);

        req.token = token;
        req.user = findUser;
        // console.log(req.token);
        // console.log(req.user);

        next();

    } catch (err) {
        res.status(401).send(err);
    }
}

module.exports = auth;