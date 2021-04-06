var express = require('express');
var router = express.Router();
const app = express();
var Cookies = require('cookies')
const db = require('../models'); //contain the Contact model, which is accessible via db.Contact
const cookiesparser = require("cookie-parser");
app.use(cookiesparser());


router.post('/', (req, res) => {
    console.log("registering");
        let email =req.session.emaill ;
        let firstName =req.session.firstName;
        let lastName=req.session.lastName;
        let pass= req.body.passwords;
        return db.Contact.create({email:email,firstName:firstName,lastName:lastName,password:pass})
            .then((contact) =>  res.render('logIn', {
                title: 'log In ',
                path: '/logIn',
                invalidPassword:req.session.invallablePassword === true,
                invalidEmail:req.session.invalidEmail === true
            }))
            .catch((err) => {
                console.log('***There was an error creating a contact', JSON.stringify(err))
                return res.status(400).send(err)
            })
});

module.exports = router;
