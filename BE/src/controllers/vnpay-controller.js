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

        const { amount, orderInfo = 'Thanh toan don hang', bankCode } = req.body;

        if (!amount || amount < 1000) {
            return res.status(400).json({
                success: false,
                message: 'Số tiền không hợp lệ'
            });
        }

        const orderId = Date.now().toString();

        const paymentUrl = vnpayService.createPaymentUrl({
            amount: Number(amount),
            orderId,
            orderInfo,
            bankCode,
            ipAddr,
        });

        return res.json({
            success: true,
            orderId,
            paymentUrl
        });
    }

    // GET /vnpay/return - redirect từ VNPay trả về CLIENT
    returnUrl(req, res) {
        const vnp_Params = { ...req.query };

        // Kiểm tra chữ ký
        const isValid = verifySignature(vnp_Params, vnpayConfig.hashSecret);

        if (!isValid) {
            return res.json({
                success: false,
                message: 'Chữ ký không hợp lệ!',
                code: 'INVALID_HASH',
                data: vnp_Params
            });
        }

        const code = vnp_Params.vnp_ResponseCode;
        const orderId = vnp_Params.vnp_TxnRef;
        const amount = Number(vnp_Params.vnp_Amount) / 100;

        return res.json({
            success: code === '00',
            orderId,
            amount,
            code,
            message:
                code === '00'
                    ? 'Thanh toán thành công!'
                    : `Thanh toán thất bại (mã lỗi: ${code})`,
            data: vnp_Params
        });
    }

    // GET /vnpay/ipn - VNPay gọi server → phải verify và update DB
    ipnUrl(req, res) {
        const vnp_Params = { ...req.query };
        const isValid = verifySignature(vnp_Params, vnpayConfig.hashSecret);

        if (!isValid) {
            return res.json({ RspCode: '97', Message: 'Fail checksum' });
        }

        const orderId = vnp_Params.vnp_TxnRef;
        const rspCode = vnp_Params.vnp_ResponseCode;

        // Nếu thanh toán thành công (00)
        if (rspCode === '00') {
            console.log('✔ IPN xác nhận: Thanh toán thành công cho Order:', orderId);
            // TODO: update DB status
            return res.json({ RspCode: '00', Message: 'success' });
        }

        console.log('✘ IPN xác nhận thất bại:', rspCode);
        return res.json({ RspCode: rspCode, Message: 'Transaction failed' });
    }
}

module.exports = new VnpayController();
