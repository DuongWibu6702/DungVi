const { body } = require('express-validator');

/*
|--------------------------------------------------------------------------
| RULE KIỂM TRA MẬT KHẨU MẠNH
|--------------------------------------------------------------------------
*/
const strongPassword = body('password')
    .notEmpty().withMessage('Mật khẩu không được để trống')
    .isLength({ min: 12 }).withMessage('Mật khẩu phải tối thiểu 12 ký tự')
    .matches(/[A-Z]/).withMessage('Mật khẩu phải chứa chữ hoa')
    .matches(/[a-z]/).withMessage('Mật khẩu phải chứa chữ thường')
    .matches(/\d/).withMessage('Mật khẩu phải chứa số')
    .matches(/[^A-Za-z0-9]/).withMessage('Mật khẩu phải chứa ký tự đặc biệt');

/*
|--------------------------------------------------------------------------
| ĐĂNG KÝ (REGISTER)
|--------------------------------------------------------------------------
*/
exports.registerRules = [

    // NAME
    body('name')
        .trim()
        .notEmpty().withMessage('Tên không được để trống')
        .isLength({ min: 2, max: 100 })
        .withMessage('Tên phải từ 2 đến 100 ký tự')
        .escape(),

    // EMAIL
    body('email')
        .trim()
        .notEmpty().withMessage('Email không được để trống')
        .isEmail().withMessage('Email không hợp lệ')
        .normalizeEmail(),

    // PHONE (VN)
    body('phone')
        .trim()
        .notEmpty().withMessage('Số điện thoại không được để trống')
        .matches(/^(\+84|0)(3|5|7|8|9)\d{8}$/)
        .withMessage('Số điện thoại không hợp lệ (VN)'),

    // PASSWORD MẠNH
    strongPassword,

    // CONFIRM PASSWORD
    body('confirmPassword')
        .trim()
        .notEmpty().withMessage('Vui lòng nhập lại mật khẩu')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Mật khẩu nhập lại không khớp');
            }
            return true;
        })
];

/*
|--------------------------------------------------------------------------
| ĐĂNG NHẬP (LOGIN)
|--------------------------------------------------------------------------
*/
exports.loginRules = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email không được để trống')
        .isEmail().withMessage('Email không hợp lệ')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('Mật khẩu không được để trống')
];

/*
|--------------------------------------------------------------------------
| CẬP NHẬT THÔNG TIN USER
|--------------------------------------------------------------------------
*/
exports.updateUserRules = [

    body('name')
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Tên phải từ 2 đến 100 ký tự')
        .escape(),

    body('phone')
        .optional({ checkFalsy: true })
        .trim()
        .matches(/^(\+84|0)(3|5|7|8|9)\d{8}$/)
        .withMessage('Số điện thoại không hợp lệ (VN)'),

    body('email')
        .optional({ checkFalsy: true })
        .trim()
        .isEmail().withMessage('Email không hợp lệ')
        .normalizeEmail()
];

/*
|--------------------------------------------------------------------------
| ĐỔI MẬT KHẨU
|--------------------------------------------------------------------------
*/
exports.changePasswordRules = [

    body('oldPassword')
        .trim()
        .notEmpty().withMessage('Mật khẩu cũ không được để trống'),

    strongPassword,

    body('confirmPassword')
        .trim()
        .notEmpty().withMessage('Vui lòng nhập lại mật khẩu')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Mật khẩu nhập lại không khớp');
            }
            return true;
        })
];
