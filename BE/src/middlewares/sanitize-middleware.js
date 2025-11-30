// sanitizeInput.js
module.exports = function sanitizeInput(req, res, next) {
    // Chỉ xử lý body JSON
    if (req.body && typeof req.body === "object") {
        req.body = sanitizeObject(req.body);
    }
    next();
};

function sanitizeObject(obj) {
    console.log("Sanitizing object:", obj   );
    Object.keys(obj).forEach(key => {
        let value = obj[key];

        if (typeof value === "string") {
            obj[key] = sanitizeString(value);
        } 
        else if (typeof value === "object" && value !== null) {
            obj[key] = sanitizeObject(value);
        }
    });

    return obj;
}

function sanitizeString(str) {
    return str
        .replace(/<script.*?>.*?<\/script>/gi, "")   // bỏ toàn bộ <script>...</script>
        .replace(/on\w+=".*?"/gi, "")               // xóa các event (onclick, onerror...)
        .replace(/on\w+='.*?'/gi, "")               // event dạng ''
        .replace(/</g, "&lt;")                      // encode <  
        .replace(/>/g, "&gt;");                     // encode >
}
