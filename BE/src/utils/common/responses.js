
const SuccessResponse = (data, message = "Successful the request", status) => {
    return {
        success: true,
        status: status,
        message: message,
        data: data,
    }
}

const ErrorResponse = (error, message = "Error occurred",status) => {
    return {
        success: false,
        status: status,
        message: message,
        data: {},
        error: error
    }
}

const PaginationResponse = ( items, pagination, message = "Successful the request",status) => {
    return {
        success: true,
        status: status,
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