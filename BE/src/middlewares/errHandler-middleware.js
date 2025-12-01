const { StatusCodes } = require('http-status-codes');
const { Responses } = require('../utils/common');

function errorHandler(err, req, res, next) {
    console.error("🔥 ERROR:", err);

    // Lỗi do AppError do mình ném ra
    if (err.statusCode) {
        const response = Responses.ErrorResponse(err.message);
        return res.status(err.statusCode).json(response);
    }

    // Nếu là lỗi sequelize validation 
    if (err.name === 'SequelizeValidationError') {
        const msg = err.errors.map(e => e.message).join(', ');
        const response = Responses.ErrorResponse('Validation Error: ' + msg);
        return res.status(StatusCodes.BAD_REQUEST).json(response);
    }
    if (err && err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json(Responses.ErrorResponse("Only one image is allowed"," Only one image is allowed", StatusCodes.BAD_REQUEST));
    }
    if (err && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json(Responses.ErrorResponse("File size is too large"," File size is too large", StatusCodes.BAD_REQUEST));
    }

    // Lỗi không xác định
    const response = Responses.ErrorResponse('Internal Server Error');
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(response);

}

module.exports = errorHandler;