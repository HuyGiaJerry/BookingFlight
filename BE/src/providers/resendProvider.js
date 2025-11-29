const { Resend } = require('resend');

const apiKey = 're_Hhs4PzKT_DzMEuKEbVoAB1CaqiLfXD9Rp';

const ADMIN_EMAIL = 'Booking-Flight@booking-flight-app.io.vn'

const resendInstance = new Resend(apiKey)

// Function to resend email

async function sendEmail(to, subject, html) {
    try {
        const data = await resendInstance.emails.send({
            from: ADMIN_EMAIL,
            to,  // nếu chưa verify domain thì chỉ gửi được email này
            subject,
            html
        })
        return data;
    }
    catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}

module.exports = {
    sendEmail
}




