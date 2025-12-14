const vnpayService = require('../services/vnpay-service');
const { verifySignature } = require('../utils/vnpay');
const vnpayConfig = require('../config/vnpay');

class VnpayController {

    // POST /vnpay/create - client gọi để lấy paymentUrl
    createPayment(req, res) {
        const ipAddr =
            req.headers['x-forwarded-for']?.split(',')[0] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            '127.0.0.1';

        const { amount, booking_session_id, bankCode } = req.body;

        if (!booking_session_id) {
            return res.status(400).json({
                success: false,
                message: 'Missing booking_session_id'
            });
        }

        const orderId = Date.now().toString();

        const paymentUrl = vnpayService.createPaymentUrl({
            amount: Number(amount),
            orderId,
            orderInfo: `BOOKING|${booking_session_id}`,
            bankCode,
            ipAddr,
        });

        return res.json({
            success: true,
            paymentUrl,
        });
    }

    returnUrl(req, res) {
        const vnp_Params = { ...req.query };

        const isValid = verifySignature(vnp_Params, vnpayConfig.hashSecret);

        const code = vnp_Params.vnp_ResponseCode;
        const orderId = vnp_Params.vnp_TxnRef;
        const amount = Number(vnp_Params.vnp_Amount) / 100;

        // ❗ URL FE — đổi theo domain FE của bạn
        const FE_RETURN_URL = `${process.env.FE_URL}`;

        const redirectUrl = `${FE_RETURN_URL}?code=${code}&orderId=${orderId}&amount=${amount}`;

        return res.redirect(redirectUrl);
    }

    // GET /vnpay/ipn - VNPay gọi server → phải verify và update DB
    async ipnUrl(req, res) {

        try {
            console.log("🔔 VNPay IPN received aaaaaaaaaaaaaaaaaaa :", req.query);
            const vnp_Params = { ...req.query };

            // 1) Verify checksum
            const isValid = verifySignature(vnp_Params, vnpayConfig.hashSecret);
            if (!isValid) {
                return res.json({ RspCode: '97', Message: 'Invalid Checksum' });
            }

            const rspCode = vnp_Params.vnp_ResponseCode;
            const amount = Number(vnp_Params.vnp_Amount) / 100;
            const orderId = vnp_Params.vnp_TxnRef;
            const orderInfo = vnp_Params.vnp_OrderInfo;

            // orderInfo = "BOOKING|session_123"
            const [prefix, bookingSessionId] = orderInfo.split("|");

            if (prefix !== "BOOKING" || !bookingSessionId) {
                return res.json({ RspCode: '99', Message: 'Invalid booking session' });
            }

            // Nếu thanh toán thất bại
            if (rspCode !== "00") {
                console.log("❌ VNPay Payment Failed:", rspCode);
                return res.json({ RspCode: rspCode, Message: 'Payment Failed' });
            }

            // 2) Thanh toán thành công → tạo booking thật
            const result = await bookingService.confirmBooking({
                bookingSessionId,
                amount,
                transactionId: orderId,
                rawData: vnp_Params
            });

            console.log("✔ Booking created:", result.bookingId);

            return res.json({ RspCode: '00', Message: 'Confirm Success' });

        } catch (err) {
            console.error("IPN ERROR:", err);
            return res.json({ RspCode: '99', Message: 'Server Error' });
        }
    }
}

module.exports = new VnpayController();
