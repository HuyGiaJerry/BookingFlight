const express = require('express');
const router = express.Router();
const upload = require('../../middlewares/upload');
const {uploadSingleImage,uploadMultipleImages} = require('../../controllers/upload-controller');

router.post("/upload-images", upload.array('images',10), uploadMultipleImages);

module.exports = router;