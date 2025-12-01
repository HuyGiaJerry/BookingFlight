const multer = require('multer');

const storage = multer.memoryStorage(); // Lưu file vào RAM 

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // Giới hạn kích thước file 10MB
});

module.exports = upload;