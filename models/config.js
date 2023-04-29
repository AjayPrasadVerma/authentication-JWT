const mongoose = require('mongoose');

mongoose.set('strictQuery', true);
mongoose.connect("mongodb://127.0.0.1:27017/ajay")
    .then(() => {
        console.log("connected.......");
    }).catch((err) => {
        console.log(err);
    })
