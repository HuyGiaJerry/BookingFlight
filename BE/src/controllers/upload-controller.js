const {UploadService} = require('../services');
const {StatusCodes} = require('http-status-codes');
const {Responses} = require('../utils/common');
const { url } = require('../config/cloudinary');

exports.uploadSingleImage = async (req, res) => {
    try {
        if(!req.file) {
            return res.status(StatusCodes.BAD_REQUEST).json(Responses.ErrorResponse("No file uploaded",message="No file uploaded", StatusCodes.BAD_REQUEST));
        }
        const result = await UploadService.uploadToCloudinary(req.file.buffer, "booking_flight_app/images");

        return res.json({
            message: "Image uploaded successfully",
            url: result.url,
            public_id: result.public_id
        });
    } catch (error) {
        console.error("Error uploading image:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(Responses.ErrorResponse(error,message="Failed to upload image", StatusCodes.INTERNAL_SERVER_ERROR));
    }
}

exports.uploadMultipleImages = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(StatusCodes.BAD_REQUEST).json(
                Responses.ErrorResponse("No files uploaded", "No files uploaded", StatusCodes.BAD_REQUEST)
            );
        }
        const results = [];
        for (const file of req.files) {
            const result = await UploadService.uploadToCloudinary(file.buffer, "booking_flight_app/images");
            results.push({
                filename: file.originalname,
                url: result.url,
                public_id: result.public_id
            });
        }
        return res.json({
            message: "Images uploaded successfully",
            images: results
        });
    } catch (error) {
        console.error("Error uploading images:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(
            Responses.ErrorResponse(error, "Failed to upload images", StatusCodes.INTERNAL_SERVER_ERROR)
        );
    }
};