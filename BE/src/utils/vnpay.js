
// const crypto = require('crypto');
// const qs = require('qs');

// const sortObject = (obj) => {
//     const sorted = {};
//     Object.keys(obj)
//         .sort()
//         .forEach((key) => {
//             sorted[key] = obj[key];
//         });
//     return sorted;
// };

// const createSignature = (data, secret) => {
//     const signData = qs.stringify(data, { encode: false });
//     return crypto.createHmac('sha512', secret).update(signData, 'utf8').digest('hex');
// };

// const verifySignature = (params, secret) => {
//     const secureHash = params.vnp_SecureHash;
//     if (!secureHash) return false;

//     delete params.vnp_SecureHash;
//     delete params.vnp_SecureHashType;

//     // 🔥 Encode lại giá trị giống lúc tạo payment URL
//     Object.keys(params).forEach((key) => {
//         params[key] = encodeURIComponent(params[key]).replace(/%20/g, '+');
//     });

//     const sortedParams = sortObject(params);
//     const calculatedHash = createSignature(sortedParams, secret);
//     return secureHash === calculatedHash;
// };

// module.exports = { sortObject, createSignature, verifySignature };

const crypto = require('crypto');
const qs = require('qs');

const sortObject = (obj) => {
    const sorted = {};
    Object.keys(obj).sort().forEach((key) => {
        sorted[key] = obj[key];
    });
    return sorted;
};

const createSignature = (data, secret) => {
    const signData = qs.stringify(data, { encode: false });
    return crypto.createHmac('sha512', secret).update(signData, 'utf-8').digest('hex');
};

const verifySignature = (params, secret) => {
    const vnp_Params = { ...params };
    const secureHash = vnp_Params.vnp_SecureHash;
    if (!secureHash) return false;

    delete vnp_Params.vnp_SecureHash;
    delete vnp_Params.vnp_SecureHashType;

    // Encode lại value từng trường
    Object.keys(vnp_Params).forEach((key) => {
        vnp_Params[key] = encodeURIComponent(vnp_Params[key]).replace(/%20/g, '+');
    });

    const sortedParams = sortObject(vnp_Params);
    const calculatedHash = createSignature(sortedParams, secret);
    return secureHash === calculatedHash;
};

module.exports = { sortObject, createSignature, verifySignature };
