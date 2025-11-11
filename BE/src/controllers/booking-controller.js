const { StatusCodes } = require('http-status-codes');
const { BookingService } = require('../services');
const { SuccessResponse } = require('../utils/common');

const bookingService = new BookingService();



/*
    Khởi tạo booking draft : tạo booking tạm thời khi ng dùng chọn 1 flight schedule cụ thể 

*/
async function initializeBooking(req, res, next) {
    try {
        const { user_id, flight_schedules, booking_type, passenger_count } = req.body;

        // validate require fields
        if (!user_id || !flight_schedules || !booking_type || !passenger_count) return next(new Error("Missing required fields: user_id, flight_schedules, booking_type, passenger_count"));

        const result = await bookingService.initializeBooking({
            user_id,
            flight_schedules, // [id,flight_type]
            booking_type, // one-way / round-trip
            passenger_count
        })

        SuccessResponse.message = "Booking draft initialized successfully";
        SuccessResponse.data = result;

        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        next(error);
    }
}

/*
    Lấy thông tin chi tiết booking hiển thị form (flight,seat layout,available services)
*/

async function getBookingDetails(req, res, next) {
    try {
        const { bookingId } = req.params;

        if (!bookingId) return next(new Error("Missing required field: bookingId"));

        const result = await bookingService.getBookingDetails(bookingId);
        SuccessResponse.message = "Booking details fetched successfully";
        SuccessResponse.data = result;
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        next(error);
    }
}


/*
    Lấy layout ghế của 1 flight schedule
*/

async function getSeatLayout(req, res, next) {
    try {
        const { flightScheduleId } = req.params;

        if (!flightScheduleId) return next(new Error("Missing required field: flightScheduleId"));

        const seatLayout = await bookingService.getSeatLayout(flightScheduleId);

        SuccessResponse.message = "Seat layout fetched successfully";
        SuccessResponse.data = seatLayout;
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        next(error);
    }
} 


/*
    Thêm thông tin từng hành khách
*/

async function addPassengers(req, res, next) {
    try {
        const { bookingId } = req.params;
        const { passengers } = req.body; // passengers[] (fullname,dob,passport_number,passport_expiry,national.....)
        if(!bookingId || !passengers) return next(new Error("Missing required fields: bookingId, passengers"));

        const result = await bookingService.addPassengers(bookingId, passengers);
        SuccessResponse.message = "Passengers added successfully";
        SuccessResponse.data = result;
        return res.status(StatusCodes.OK).json(SuccessResponse);

    } catch (error) {
        next(error);
    }
}

/*
    Chọn ghế cho từng hành khách => reserve seats for passengers
*/

async function selectSeats(req, res, next) {
    try {
        const { bookingId } = req.params;
        const { seatSelections } = req.body; // seat_selections[] (passenger_id, seat_id, flight_schedule_id)
        if(!bookingId || !seatSelections) return next(new Error("Missing required fields: bookingId, seatSelections"));

        const result = await bookingService.selectSeats(bookingId, seatSelections);
        SuccessResponse.message = result.message;
        SuccessResponse.data = result;
        return res.status(StatusCodes.OK).json(SuccessResponse);

    } catch (error) {
        next(error);
    }
}

/*
    Thêm dịch vụ bổ sung cho booking: (meal,baggage,priority...)
*/
async function addExtraServices(req, res, next) {
    try {
        const { bookingId } = req.params;
        const { services } = req.body; // services[] (service_id, quantity, flight_schedule_id, passenger_id)

        if(!bookingId || !services) return next(new Error("Missing required fields: bookingId, services"));

        const result = await bookingService.addExtraServices(bookingId, services);

        SuccessResponse.message = result.message;
        SuccessResponse.data = result;
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        next(error);
    }
}


/*
    Lấy tóm tắt booking để review -> trc khi confirm booking
*/

async function getBookingSummary(req, res, next) {

    try {
        const { bookingId } = req.params;

        if(!bookingId) return next(new Error("Missing required field: bookingId"));


        const result = await bookingService.getBookingSummary(bookingId);

        SuccessResponse.message = "Booking summary fetched successfully";
        SuccessResponse.data = result;
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        next(error);
    }
}

/*
    Xác nhận booking + thanh toán
*/

async function confirmBooking(req, res, next) {
    try {
        const { bookingId } = req.params;
        if(!bookingId) return next(new Error("Missing required field: bookingId"));

        const result = await bookingService.confirmBooking(bookingId);

        SuccessResponse.message = result.message;
        SuccessResponse.data = result;
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        next(error);
    }
}

/*
    Tạo vé sau confirmed booking
*/

async function createTickets(req, res, next) {
    try {
        const { bookingId } = req.params;
        const {ticket_data} = req.body; // ticket_data[] (passenger_id, flight_schedule_id, seat_id,fare_id)
        if(!bookingId || !ticket_data) return next(new Error("Missing required fields: bookingId, ticket_data"));

        const result = await bookingService.createTickets(bookingId, ticket_data);

        SuccessResponse.message = result.message;
        SuccessResponse.data = result;
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        next(error);
    }
}

/*
    Hủy booking
*/

async function cancelBooking(req, res, next) {
    try {
        const { bookingId } = req.params;
        const {reason} = req.body;
        if(!bookingId || !reason) return next(new Error("Missing required fields: bookingId, reason"));
        const result = await bookingService.cancelBooking(bookingId, reason);

        SuccessResponse.message = result.message;
        SuccessResponse.data = result;
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    initializeBooking,
    getBookingDetails,
    getSeatLayout,
    addPassengers,
    selectSeats,
    addExtraServices,
    getBookingSummary,
    confirmBooking,
    createTickets,
    cancelBooking
};