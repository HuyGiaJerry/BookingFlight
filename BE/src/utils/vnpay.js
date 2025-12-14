const crypto = require('crypto');
const qs = require('qs');

const sortObject = (obj) => {
    return Object.keys(obj)
        .sort()
        .reduce((result, key) => {
            result[key] = obj[key];
            return result;
        }, {});
};

const createSignature = (params, secret) => {
    const signData = qs.stringify(params, { encode: false });
    return crypto
        .createHmac('sha512', secret)
        .update(signData, 'utf-8')
        .digest('hex');
};

const verifySignature = (params, secret) => {
    const vnp_Params = { ...params };

    const secureHash = vnp_Params.vnp_SecureHash;
    if (!secureHash) return false;

    delete vnp_Params.vnp_SecureHash;
    delete vnp_Params.vnp_SecureHashType;

    const sortedParams = sortObject(vnp_Params);
    const calculatedHash = createSignature(sortedParams, secret);

    return calculatedHash === secureHash;
};

module.exports = { sortObject, createSignature, verifySignature };
