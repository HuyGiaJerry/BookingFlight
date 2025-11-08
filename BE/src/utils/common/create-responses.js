

const createSuccessResponse = (data, message = "Successful the request") => {
    return {
        success: true,
        message: message,
        data: data,
        error: {}
    }
}

const createErrorResponse = (error, message = "Error occurred") => {
    return {
        success: false,
        message: message,
        data: {},
        error: error
    }
}

module.exports = {
    createSuccessResponse,
    createErrorResponse
};