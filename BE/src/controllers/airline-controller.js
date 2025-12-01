const { StatusCodes } = require('http-status-codes');
const AppError = require('../utils/errors/app-error');
const { AirlineService } = require('../services');
const {Responses} = require('../utils/common');
const {UploadService} = require('../services'); 
const airlineService = new AirlineService();

async function createAirline(req, res, next) {
    try {
        // Validate dữ liệu đầu vào trước 
        const { name, iata_code } = req.body;
        if(!name || !iata_code) {
            return res.status(StatusCodes.BAD_REQUEST)
                    .json(Responses.ErrorResponse("Name and IATA code are required", "Name and IATA code are required", StatusCodes.BAD_REQUEST));  
        }
        if(!req.file) {
            return res.status(StatusCodes.BAD_REQUEST)
                    .json(Responses.ErrorResponse("Airline logo is required", "Airline logo is required", StatusCodes.BAD_REQUEST));
        }
        let logo_url = null;
        let logo_public_id = null;
        const uploadImage = await UploadService.uploadToCloudinary(req.file.buffer, "booking_flight_app/airline_logos");
        logo_url = uploadImage.url;
        logo_public_id = uploadImage.public_id;
        
        const newAirline = await airlineService.createAirline({...req.body, logo_url, logo_public_id});
        return res
            .status(StatusCodes.CREATED)
            .json(Responses.SuccessResponse(newAirline,'Airline created successfully', StatusCodes.CREATED));
    } catch (error) {
        next(error);
    }
}


async function getAllAirlines(req, res, next) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        
        const order = [['id', 'ASC']];
        const airlines = await airlineService.getAllAirlines(page, limit);
        
        return res
            .status(StatusCodes.OK)
            .json(Responses.PaginationResponse(airlines.items, airlines.pagination,'Airlines retrieved successfully', StatusCodes.OK));
    } catch (error) {
        next(error);
    }
}


async function getAirlineById(req, res, next) {
    try {
        const airline = await airlineService.getAirlineById(req.params.id);
        return res
            .status(StatusCodes.OK)
            .json(Responses.SuccessResponse(airline,'Airline retrieved successfully', StatusCodes.OK));
    } catch (error) {
        next(error);
    }
}

async function updateAirline(req, res,next) {
    try {
        const updatedAirline = await airlineService.updateAirline(req.params.id, req.body);
        return res
            .status(StatusCodes.OK)
            .json(Responses.SuccessResponse(updatedAirline,'Airline updated successfully', StatusCodes.OK));
    } catch (error) {
        next(error);
    }
}

async function deleteAirline(req, res, next) {
    try {
        const airline = await airlineService.getAirlineById(req.params.id);
        if (airline && airline.logo_public_id) {
            await UploadService.deleteFromCloudinary(airline.logo_public_id);
        }
        await airlineService.deleteAirline(req.params.id);
        return res
            .status(StatusCodes.NO_CONTENT)
            .json(Responses.SuccessResponse(null,'Airline deleted successfully', StatusCodes.NO_CONTENT));
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createAirline,
    getAllAirlines,
    getAirlineById,
    updateAirline,
    deleteAirline
};