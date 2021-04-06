const path = require('path');

const express = require('express');

const productsController = require('../controller/SignIn');

const router = express.Router();

// /admin/add-product => GET
router.get('/', productsController.getHisData);

router.get('/password', productsController.getaPassword);

router.get('/login',productsController.log);

router.get('/logout',productsController.logout);

router.get('/registering',productsController.registering);

router.get('/weather',productsController.weatherPage);

router.post('/login', productsController.logIn);

// /admin/add-product => POST
router.post('/', productsController.chechTheMail);

router.post('/password', productsController.enterPassword);

module.exports = router;
