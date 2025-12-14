// const moment = require('moment');
// const qs = require('qs');
// const { sortObject, createSignature } = require('../utils/vnpay');
// const vnpayConfig = require('../config/vnpay');

// class VnpayService {
//     createPaymentUrl({ amount, orderId, orderInfo, bankCode = '', ipAddr, locale = 'vn' }) {
//         const createDate = moment().format('YYYYMMDDHHmmss');

//         let vnp_Params = {
//             vnp_Version: '2.1.0',
//             vnp_Command: 'pay',
//             vnp_TmnCode: vnpayConfig.tmnCode,
//             vnp_Locale: locale,
//             vnp_CurrCode: 'VND',
//             vnp_TxnRef: orderId,
//             vnp_OrderInfo: orderInfo,
//             vnp_OrderType: 'other',
//             vnp_Amount: Math.round(amount * 100),
//             vnp_ReturnUrl: vnpayConfig.returnUrl, // FE
//             vnp_IpnUrl: vnpayConfig.ipnUrl,       // ✅ IPN
//             vnp_IpAddr: ipAddr,
//             vnp_CreateDate: createDate,
//         };

//         if (bankCode) vnp_Params.vnp_BankCode = bankCode;

//         // 1️⃣ SORT
//         const sortedParams = sortObject(vnp_Params);

//         // 2️⃣ SIGN
//         const secureHash = createSignature(sortedParams, vnpayConfig.hashSecret);

//         // 3️⃣ APPEND HASH
//         sortedParams.vnp_SecureHash = secureHash;

//         // 4️⃣ BUILD URL
//         return vnpayConfig.url + '?' + qs.stringify(sortedParams, { encode: false });
//     }
// }

// module.exports = new VnpayService();


const moment = require('moment');
const qs = require('qs');
const { sortObject, createSignature } = require('../utils/vnpay');
const vnpayConfig = require('../config/vnpay');

class VnpayService {
    createPaymentUrl({ amount, orderId, orderInfo, bankCode = '', ipAddr, locale = 'vn' }) {
        const createDate = moment().format('YYYYMMDDHHmmss');

        let vnp_Params = {
            vnp_Version: '2.1.0',
            vnp_Command: 'pay',
            vnp_TmnCode: vnpayConfig.tmnCode,
            vnp_Locale: locale,
            vnp_CurrCode: 'VND',
            vnp_TxnRef: orderId,
            vnp_OrderInfo: orderInfo,
            vnp_OrderType: '250000',
            vnp_Amount: amount * 100,
            vnp_ReturnUrl: vnpayConfig.returnUrl,
            vnp_IpnUrl: vnpayConfig.ipnUrl,
            vnp_IpAddr: ipAddr,
            vnp_CreateDate: createDate,
        };

        // ❗ Nếu có bankCode thì thêm, còn không thì bỏ hẳn
        if (bankCode) vnp_Params.vnp_BankCode = bankCode;

        // 🔥 BƯỚC QUAN TRỌNG: encode từng giá trị giống tài liệu VNPay
        Object.keys(vnp_Params).forEach((key) => {
            vnp_Params[key] = encodeURIComponent(vnp_Params[key]).replace(/%20/g, '+');
        });

        // Sắp xếp key theo alphabet
        const sortedParams = sortObject(vnp_Params);

        // Ký SHA512 trên chuỗi đã encode
        const secureHash = createSignature(sortedParams, vnpayConfig.hashSecret);
        sortedParams.vnp_SecureHash = secureHash;
        // (tuỳ, có thể thêm)
        // sortedParams.vnp_SecureHashType = 'SHA512';

        // Tạo URL (KHÔNG encode thêm lần nữa)
        return vnpayConfig.url + '?' + qs.stringify(sortedParams, { encode: false });
    }
}

module.exports = new VnpayService();
