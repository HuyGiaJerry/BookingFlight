const express = require('express');

const {HomeController} = require('../../controllers');
const userRouter = require('./user-routes');
const router = express.Router();

router.use('/users', userRouter);
router.get('/home', HomeController.home);


module.exports = router;