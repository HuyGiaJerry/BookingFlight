module.exports = {
    tmnCode: process.env.VNP_TMNCODE,
    hashSecret: process.env.VNP_HASHSECRET,
    url: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
    returnUrl: process.env.VNP_RETURNURL,
    api: 'https://sandbox.vnpayment.vn/merchant_webapi/api/transaction',
};
