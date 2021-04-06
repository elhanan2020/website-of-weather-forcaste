var Cookies = require('cookies')
const  express =require("express");
const db = require('../models');
const app = express();
const cookiesparser = require("cookie-parser");
app.use(cookiesparser());
var keys = ['keyboard cat']

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`
//######################################################################################################################
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`

//this function show to the user  a "signup" html  pages when i enter a url "localhost:3000/

exports.getHisData = (req, res, next) => {
    let temp = req.session.alreadyExist;
    req.session.alreadyExist =  false;
    res.render('SignUp', {
        title: 'SignUp ',
        path: '/register',
        connected: req.session.logIn === true,
        youAreRegistered: req.session.register === true,
        isWasaProblem:temp
    });

};
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`
//######################################################################################################################
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`

//when i enter a email with name and last name i check i the first if the email already exist in the database
// if yes i send to the user a appropriate message if is yet not in the database then i can move on to the next step

exports.chechTheMail = (req, res, next) => {
        db.Contact.findOne({where: {email: req.body.mail.toLowerCase()}}).then(function(maill) {
            if (!maill) {
                req.session.alreadyExist =  false;
                req.session.firstName =  req.body.firstName;
                req.session.emaill =   req.body.mail.toLowerCase();
                req.session.lastName  =  req.body.Secondname;
                var cookies = new Cookies(req, res, {keys: keys});
                cookies.set('Registered',"cookies",
                    {signed: true, maxAge: 60 * 1000});
                res.redirect('/register/password');
            } else {
                req.session.alreadyExist =  true;
                res.redirect('/register');
            }
        })
};
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`
//######################################################################################################################
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`

//when i  get the email i show  the next page to get from the user his password
exports.getaPassword = (req, res, next) => {
    res.render('password', {
        title: 'Password ',
        connected: req.session.logIn === true,
        youAreRegistered: req.session.register === true,
        path: '/Password',
    });
};
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`
//######################################################################################################################
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`

//this function is called when the user want to enter in his account

exports.logIn = (req, res, next) => {
    req.session.emaill =  req.body.mail.toLowerCase();
    req.session.register = false;
    db.Contact.findOne({where: {email: req.body.mail.toLowerCase()}})
        .then(function(passwords) {
        if (passwords.password.toString() === req.body.passwords){
            req.session.logIn = true;
            var cookies = new Cookies(req, res, {keys: keys});
            cookies.set('username',req.body.mail.toLowerCase(),
                {signed: true, maxAge: Date.now() + 60*1000});
            req.session.firstName = passwords.firstName;
            req.session.lastName = passwords.lastName;
            console.log("anythink is  ok      ");
            res.redirect("/register/weather");
           }
           else{
            res.render('logIn' , {
                title: 'logIn' ,
                youAreRegistered: req.session.register === true,
                connected: req.session.logIn === true,
                invalidPassword: true,
                invalidEmail:false
            });
               console.log("anythink is  no ok      ");}
       }).catch((err) => {
        console.log('***There was an error getting a contact', JSON.stringify(err))
                res.render('logIn' , {
                    title: 'logIn' ,
                    connected: req.session.logIn === true,
                    invalidPassword: false,
                    youAreRegistered: req.session.register === true,
                    invalidEmail: true
                });

           });

};

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`
//######################################################################################################################
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`

// this function checks if more than a minute has passed between the moment of the login and the entry of the password
exports.enterPassword = (req, res, next) => {
    var cookies = new Cookies(req, res, {keys: keys});

    var lastVisit = cookies.get('Registered', {signed: true});
    if (lastVisit) {
        req.session.password = req.body.passwords;
        res.redirect("/register/registering");
    } else
        res.redirect("/register");
};
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`
//######################################################################################################################
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`

//this function show to user the "login" html pages
exports.log = (req , res , next) => {
    res.render('logIn' , {
        title: 'logIn' ,
        youAreRegistered: req.session.register === true,
        connected: req.session.logIn === true,
        invalidPassword:false,
        invalidEmail:false
    });
};
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`
//######################################################################################################################
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`
//this is an function to disconnected from account
exports.logout = (req , res , next) => {
    req.session.destroy(null);
    res.redirect("/register/login")
};
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`
//######################################################################################################################
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`
// when the user is connected to his account i show him his city who as in the database

exports.weatherPage = (req , res , next) => {
    if(req.session.logIn === true) {
        res.render('weather', {
            title: 'weather',
            connected: req.session.logIn === true,
            youAreRegistered: req.session.register === true,
            Username: req.session.firstName+" "+req.session.lastName
        });
    }
    else
        res.redirect("/register/login");
};
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`
//######################################################################################################################
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`
//after get the password from the user i enter all data about him in the data base

exports.registering = (req , res , next) => {
    req.session.register =  true;
    const email = req.session.emaill;
    const firstName = req.session.firstName;
    const lastName = req.session.lastName;
    const password = req.session.password;
    console.log(email ,firstName,lastName,password);
    return db.Contact.create({email ,firstName,lastName,password})
        .then((contact) =>  res.render('logIn', {
            title: 'log In ',
            path: '/logIn',
            connected: req.session.logIn === true,
            youAreRegistered: req.session.register === true,
            invalidPassword:req.session.invallablePassword === true,
            invalidEmail:req.session.invalidEmail === true
        }))
        .catch((err) => {
            console.log('***There was an error creating a contact', JSON.stringify(err));
            req.session.logIn = false;
            req.session.alreadyExist =  true;
            res.redirect("/register");
        })
};