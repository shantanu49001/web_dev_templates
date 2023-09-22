//all thse are needed 

//if any error previals -->look through the latest tutorials

//alreay logged wala feature bhi hai isme -->or jsut say github pr jo hai usme already logged in wala hai -->express js passport js template just compre and edit thing 
//pages are changing / goog,e se jason data milega 
require('dotenv').config();  //to crete and hode keys
const express = require("express")
const bodyParser = require("body-parser");  //all req have a bodu here 
const ejs = require("ejs");
const { default: mongoose } = require("mongoose");

//sequence very imp 

var session = require('express-session');

const passport = require('passport');

const passportlocalMongoose = require("passport-local-mongoose")

//GOOGLE AUTH WORKS WITH THESE ONLY IT REQUIRES PAASWPORT JS ; MINIMUM REQ PASSPORT JS KI HAI 
const GoogleStrategy = require('passport-google-oauth20').Strategy;

//gives functinaity to passport js function findor crate f foogle auth 20
const findOrCreate = require('mongoose-findorcreate');



const app = express();



const encrypt = require("mongoose-encryption");

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

//required to save our current login sesson
app.use(session({
    secret: "Our little scret",
    resave: false,
    saveUninitialized: true,

}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://127.0.0.1:27017/userDB");

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    //new schema elements
    googleId:String,
    secret:String
});


userSchema.plugin(passportlocalMongoose);
//find or crate package function ko bhi as pluinadd krdo to userscheme
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema); //collection created 


passport.use(User.createStrategy());

//this doesn't work with google auth or any other 
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

passport.serializeUser(function (user,done) {
    done(null,user,null);
})
passport.deserializeUser(function (id,done) {
   
   //this is also a dummy function but due to packae itall lation of upar stated hai it has functionality
    User.findById(id,function (err,user) {
        done(err,user);
        
    })
    
})

//added then here upar wala bhi chhaiye hai 
passport.use(new GoogleStrategy({
    //SAME AS CREDENTIALS FROM GOOGLE AUTH
    clientID: "975521153221-bt8h6uvl155hnjjj4eq2de8gjlr8qgsl.apps.googleusercontent.com",
    // clientID: process.env.CLIENT,
    /// clientSecret: process.env.clientSecret,
    clientSecret: "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",
    //THIS CALLBACK URL MUST BE SAME AS JO GOGGLE AUTH PROJECT ME REDIRECT URL ADD KIYA HAI 
    //googlw webste project me scipe added hai jiska matlab mujhemkya kyadata chaye 
    callbackURL: "http://localhost:3000/auth/google/secrets",  //same as jo pojec google me added hai 
    //this is to be added due to api updare /deprecation
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
},
    function (accessToken, refreshToken, profile, cb) {

        //callback function that return axess token to get data to use for longer time than acess token 
        //create user or find by google -->not a mongoose function to create user in db bu t it is google made 
        //this is the psedo function no suh fuction actually exits however to make it live just install a packgae npm install mongoose-findorcreate that gieves functionalitu to this function
        //andrequire it in app.js 
       
       //google se milne ke baad we also find or crate it in our mongoose db
     //we need to chege the schema 
       User.findOrCreate({ googleId: profile.id }, function (err, user) {
            //intially this was psudeo function that did noting was just to sow in passpor js website but after installing paceks it does the wor as its name suggets to create google user if not presemt or if it is presemt them fimd ot 
            return cb(err, user);
        });
    }
));

//REGISTER AND LOGIN.EJS UI ME END POINT HIT 
app.get("/auth/google", function (req, res) {
    //amin code of suthentivation   -->see thode doc for code 
    passport.authenticate("google", { scope: ["profile"] });

});

//edirect code -->google project me redirect wala link add kiyatha wai url redirtc krna hai after auh is done by google
//this url must ,atch with the rediect url we added to foofle project 
app.get("/auth/google/secrets",
    passport.authenticate('google', { failureRedirect: '/login' }),
    function (req, res) {
        //neeche app,get("/secrets me jaao waha cotril jayega udharse wo chck kr rha hai wapas ki authentiated hai ya nhi via session and then rediect /renders ")
        res.redirect('/secrets');  //google failure se yaha redirct 

    }
);


app.get("/", function (req, res) {
    res.render("home");
});

app.get("/login", function (req, res) {
    res.render("login");
});

app.get("/register", function (req, res) {
    res.render("register");
});

app.get("/secrets", function (req, res) {

    //first it checks after rdirect hist here and then reders 
    if (req.isAuthenticated()) {
        res.render("secrets");
    }
    else {
        res.render("/login");
    }

})

//gettig te secrest we sirf page pr auth check krte page change kr rha hai 
app.get("/submit",function (req,res) {
    //check if logged in
    if (req.isAuthenticated()) {
        res.render("submit");  //direct ejs webpage chnge krta hai 
    }
    else {
        res.render("/login");
    }


    
})
//submit .ejs me code hai form ka 
//ame pagge pe ek form hai jo ki post req kr rha ha -->uska data save krna hai dhar 
app.post("/submit",function (req,res) {
   const submittessecret=req.body.secret  //inputtupe me name hai secret

   User.findById(req.user.id,function (req,foundUser) {
    if (err) {
        console.log(err);
    }
    else{
        if(!foundUser){
            //new chwma ke accoding
            foundUser.secret=submittessecret;
            //after the callback  
            foundUser.save(function (req,res) {
                res.redirect("/secrets");
            }) //save the new doc  
        }
    }
   })
});
app.get("/logout", function (req, res) {

    req.logOut();
    res.redirect("/");
});


app.post("/register", function (req, res) {

    User.register({ username: req.body.username }, req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            res.render("/register");
        } else {
            //local sargety to authenticte when user doesn't seldct google googlelogin->mongodb server hai 
            passport.authenticate("local")(req, res, function (params) {
                res.redirect("/secrets");
            })
        }
    })

});

app.post("/login", function (req, res) {


    const user = new User({
        userSchema: req.body.username,     //form se aayega 
        password: req.body.password
    });

    req.login(user, function (err) {
        if (err) {
            console.log(err);
        }
        else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/secrets");  //get req that checks if they are actually authenticated 
            })
        }
    })
});

app.listen(3000, function () {
    console.log("Server started");
})