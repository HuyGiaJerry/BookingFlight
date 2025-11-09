const { StatusCodes } = require('http-status-codes');
const { createErrorResponse } = require('../utils/common/create-responses');

function errorHandler(err, req, res, next) {
    console.error("🔥 ERROR:", err);

    // Lỗi do AppError do mình ném ra
    if (err.statusCode) {
        const response = createErrorResponse(err.message);
         return res.status(err.statusCode).json(response);
    }

    // Nếu là lỗi sequelize validation 
    if (err.name === 'SequelizeValidationError') {
        const msg = err.errors.map(e => e.message).join(', ');
        const response = createErrorResponse('Validation Error: ' + msg);
        return res.status(StatusCodes.BAD_REQUEST).json(response);
    }

    // Lỗi không xác định
    const response = createErrorResponse('Internal Server Error');
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(response);

}

module.exports = errorHandler;