const express = require('express');

const {HomeController} = require('../../controllers');
const authRouter = require('./auth-routes');
const {ProtectedRoutes} = require('../../middlewares');
const router = express.Router();


// public routes
router.use('/auth', authRouter);


// private routes
router.use(ProtectedRoutes);
// test router
router.get('/home', HomeController.home);


module.exports = router;