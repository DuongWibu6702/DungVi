const { body, param } = require('express-validator');
const sanitizeHtml = require('sanitize-html');

// Hàm sanitize body HTML
const sanitizeBodyHtml = (value) => {
    if (!value) return value;
    return sanitizeHtml(value, {
        allowedTags: [
            'p', 'br', 'b', 'i', 'u', 'strong', 'em',
            'ul', 'ol', 'li', 'a', 'img',
            'h1', 'h2', 'h3',
            'blockquote', 'pre', 'code'
        ],
        allowedAttributes: {
            a: ['href', 'name', 'target', 'rel'],
            img: ['src', 'alt', 'title', 'width', 'height']
        },
        allowedSchemes: ['http', 'https', 'data']
    });
};

/*
|--------------------------------------------------------------------------
| VALIDATE: CREATE NEWS
|--------------------------------------------------------------------------
*/
exports.createNewsRules = [
    body('name')
        .trim()
        .notEmpty().withMessage('Tên bài viết không được để trống')
        .isLength({ min: 5, max: 200 })
        .withMessage('Tên bài viết phải từ 5 đến 200 ký tự')
        .escape(),

    body('description')
        .trim()
        .notEmpty().withMessage('Mô tả không được để trống')
        .isLength({ max: 500 })
        .withMessage('Mô tả tối đa 500 ký tự')
        .escape(),

    body('body')
        .notEmpty().withMessage('Nội dung bài viết không được để trống')
        .customSanitizer(value => sanitizeBodyHtml(value)),

    body('author')
        .trim()
        .notEmpty().withMessage('Tên tác giả không được để trống')
        .isLength({ max: 100 })
        .withMessage('Tên tác giả tối đa 100 ký tự')
        .escape(),

    body('source')
        .optional({ checkFalsy: true })
        .trim()
        .isURL().withMessage('Source phải là URL hợp lệ')
        .escape(),

    body('tmpFolder')
        .optional({ checkFalsy: true })
        .trim()
        .isAlphanumeric()
        .withMessage('tmpFolder chỉ được chứa ký tự và số')
        .escape(),
];

/*
|--------------------------------------------------------------------------
| VALIDATE: UPDATE NEWS
|--------------------------------------------------------------------------
*/
exports.updateNewsRules = [
    param('id')
        .notEmpty().withMessage('ID bài viết là bắt buộc')
        .isMongoId().withMessage('ID không hợp lệ'),

    body('name')
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ min: 5, max: 200 })
        .withMessage('Tên bài viết phải từ 5 đến 200 ký tự')
        .escape(),

    body('description')
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ max: 500 })
        .withMessage('Mô tả tối đa 500 ký tự')
        .escape(),

    body('body')
        .optional({ checkFalsy: true })
        .customSanitizer(value => sanitizeBodyHtml(value)),

    body('author')
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ max: 100 })
        .withMessage('Tên tác giả tối đa 100 ký tự')
        .escape(),

    body('source')
        .optional({ checkFalsy: true })
        .trim()
        .isURL().withMessage('Source phải là URL hợp lệ'),

    body('tmpFolder')
        .optional({ checkFalsy: true })
        .trim()
        .isAlphanumeric()
        .withMessage('tmpFolder chỉ được chứa chữ và số')
        .escape(),
];
