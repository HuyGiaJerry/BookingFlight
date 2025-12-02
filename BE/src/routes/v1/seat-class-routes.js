const express = require('express');
const {SeatClassController} = require('../../controllers');

const router = express.Router();


router.get('/', SeatClassController.getAllSeatClasses);

module.exports = router;