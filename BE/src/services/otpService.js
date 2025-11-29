const redis = require("../config/redis");

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

async function saveOTP(email, otp) {
    const key = `otp:login:${email}`;
    await redis.set(key, otp, "EX", 300);
}

async function verifyOTP(email, otp) {
    const key = `otp:login:${email}`;
    const stored = await redis.get(key);
    return stored === otp;
}

async function deleteOTP(email) {
    const key = `otp:login:${email}`;
    await redis.del(key);
}

module.exports = {
    generateOTP,
    saveOTP,
    verifyOTP,
    deleteOTP
};
