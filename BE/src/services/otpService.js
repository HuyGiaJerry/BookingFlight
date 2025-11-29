const redis = require("../config/redis");

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

async function saveOTP(email, otp) {
    const key = `otp:${email}`;

    await redis.del(key);

    await redis.set(key, otp, "EX", 60 * 5);
}

async function verifyOTP(email, otp) {
    const key = `otp:${email}`;
    const stored = await redis.get(key);
    return stored === otp;
}

async function deleteOTP(email) {
    const key = `otp:${email}`;
    await redis.del(key);
}

module.exports = {
    generateOTP,
    saveOTP,
    verifyOTP,
    deleteOTP
};
