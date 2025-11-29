const Joi = require("joi");
const responses = require("../utils/common/responses");

// Schema validate
const signUpSchema = Joi.object({
    fullname: Joi.string()
        .min(2)
        .max(100)
        .pattern(/^[A-Za-zÀ-ỹà-ỹ\s]{2,100}$/)
        .required()
        .messages({
            "string.empty": "Họ tên không được để trống",
            "string.min": "Họ tên phải từ 2 ký tự",
            "string.max": "Họ tên không được vượt quá 100 ký tự",
            "string.pattern.base": "Họ tên chỉ được chứa chữ và khoảng trắng",
            "any.required": "Họ tên là bắt buộc"
        }),

    email: Joi.string()
        .email()
        .min(8)
        .max(100)
        .required()
        .messages({
            "string.empty": "Email không được để trống",
            "string.email": "Email không đúng định dạng",
            "string.min": "Email phải có ít nhất 8 ký tự",
            "string.max": "Email không được dài quá 100 ký tự",
            "any.required": "Email là bắt buộc"
        }),

    phone: Joi.string()
        .pattern(/^(0[0-9]{9})$/)
        .messages({
            "string.pattern.base": "Số điện thoại không hợp lệ (phải gồm 10 số và bắt đầu bằng 0)"
        }),

    password: Joi.string()
        .min(8)
        .required()
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#]).+$/)
        .messages({
            "string.empty": "Mật khẩu không được để trống",
            "string.min": "Mật khẩu phải có ít nhất 8 ký tự",
            "string.pattern.base":
                "Mật khẩu phải gồm chữ hoa, chữ thường, số và ký tự đặc biệt",
            "any.required": "Mật khẩu là bắt buộc"
        }),
    address: Joi.string()
        .min(5)
        .max(255)
        .required()
        .messages({
            "string.empty": "Địa chỉ không được để trống",
            "string.min": "Địa chỉ phải có ít nhất 5 ký tự",
            "string.max": "Địa chỉ không được vượt quá 255 ký tự",
            "any.required": "Địa chỉ là bắt buộc"
        })
});

module.exports = function validateSignUp(req, res, next) {
    const { error } = signUpSchema.validate(req.body, { abortEarly: false });

    if (error) {
        return res.status(400).json(responses.ErrorResponse({
            errors: error.details.map((err) => err.message)
        }));
    }

    next();
};
