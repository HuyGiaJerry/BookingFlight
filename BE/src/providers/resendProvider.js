const { Resend } = require('resend');



// console.log('API key', process.env.RESEND_API_KEY)


const resendInstance = new Resend(process.env.RESEND_API_KEY)

// Function to resend email

async function sendEmail(to, subject, html) {
    try {
        const data = await resendInstance.emails.send({
            from: process.env.ADMIN_EMAIL,
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
