//jshint esversion:6   stating files
require('dotenv').config();
const express = require("express")
const bodyParser = require("body-parser");
const ejs = require("ejs");
const { default: mongoose } = require("mongoose");


//cokkies
var session = require('express-session');
//cloies
const passport = require('passport');
//cokkies not needed to require just install
//const passportLocal=require('passport-local');
//cokkies
const passportlocalMongoose = require("passport-local-mongoose")

const app = express();


//encrption
const encrypt = require("mongoose-encryption");

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

//express session cokkies doc umentionplace it below all app.use and above where we connect to mongoose
app.use(session({
    secret: "Our little scret",
    resave: false,
    saveUninitialized: true,

}));
//cokkie
app.use(passport.initialize());
app.use(passport.session());
//connect to mongoose after installing 
mongoose.connect("mongodb://127.0.0.1:27017/userDB");
//cokkies -->passport deprwction error ki wajah se 
//mongoose.set("userCreateIndex",true);
//user schema 
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});


//cokkies -->mongosse local session after connecting to mongosse and creating user schema 
userSchema.plugin(passportlocalMongoose);


const User = new mongoose.model("User", userSchema); //collection created 

//now using the ckkies useage passport mongosse local 
//ust after user -->local stategy
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//getting the home route ejs files hai to just itna krne se ho gya hai 
app.get("/", function (req, res) {
    res.render("home");
});

app.get("/login", function (req, res) {
    res.render("login");
});

app.get("/register", function (req, res) {
    res.render("register");
});

//creating the secrets route after the sucess callbac of the refister passport libraray 
app.get("/secrets", function (req, res) {
    //already authenticated ka code 
    //agar pehlemse oggoed in hai wo inplememnt -->cokkies
    //cokkie saved my session ids 
    if (req.isAuthenticated()) {
        res.render("secrets");
    }
    else {
        res.render("/login");
    }

})

//cokkies making he logout feature 
app.get("/logout", function (req, res) {
//ckoies end that user sesson 
//passportjs ka code
req.logOut();
res.redirect("/");
});


app.post("/register", function (req, res) {
    //cooies 
    //use passpot  local package here -->cookies 
    User.register({ username: req.body.username }, req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            res.render("/register");
        } else {
            //cokkies->use the passport package 
            passport.authenticate("local")(req, res, function (params) {
                res.redirect("/secrets");
            })
        }
    })   //inbuilt passpoer local that manages 

});

//renering was get request   registering is the post req
app.post("/login", function (req, res) {
    //cookies 
    //
    const user = new User({
        userSchema: req.body.username,     //form se aayega 
        password: req.body.password
    });
    //cokkies
    //use passport ka login functionnto make user login
    req.login(user, function (err) {
        if (err) {
            console.log(err);
        }
        else {
            //sucess logged //ab iska cokkie sav e
            passport.authenticate("local")(req, res, function () {
                res.redirect("/secrets");  //get req that checks if they are actually authenticated 
            })
        }
    })
});

app.listen(3000, function () {
    console.log("Server started");
})