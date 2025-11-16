
const SuccessResponse = (data, message = "Successful the request") => {
    return {
        success: true,
        message: message,
        data: data,
        error: {}
    }
}

const ErrorResponse = (error, message = "Error occurred") => {
    return {
        success: false,
        message: message,
        data: {},
        error: error
    }
}

const PaginationResponse = (items, pagination, message = "Successful the request") => {
    return {
        success: true,
        message: message,
        data: items,
        pagination: pagination,
        error: {}
    }
}

module.exports = {
    SuccessResponse,
    ErrorResponse,
    PaginationResponse
};