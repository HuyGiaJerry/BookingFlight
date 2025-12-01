const cloudinary = require('../config/cloudinary');

const uploadToCloudinary = (fileBuffer, folder = "uploads") => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({
            folder,
            resource_type: "image",
            transformation: [
                { width: 1024, height: 1024, crop: "limit" }, // Resize ảnh, giữ nguyên tỉ lệ, max 1024x1024
                { quality: "auto" } // Tối ưu chất lượng
            ]
        },
            (error, result) => {
                if (error) return reject(error);
                resolve({
                    url: result.secure_url,
                    public_id: result.public_id
                });
            });
        stream.end(fileBuffer);
    });
}

const deleteFromCloudinary = async (public_id) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.destroy(public_id, { resource_type: "image" }, (error, result) => {
            if (error) return reject(error);
            resolve(result);
        });
    });
}

module.exports = {
    uploadToCloudinary,
    deleteFromCloudinary
};