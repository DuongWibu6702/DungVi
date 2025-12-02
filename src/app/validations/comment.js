const { body } = require('express-validator');
const mongoose = require('mongoose');

module.exports.createCommentRules = [

    // postId bắt buộc, phải là MongoId
    body('postId')
        .notEmpty().withMessage('Thiếu postId.')
        .custom(value => mongoose.Types.ObjectId.isValid(value))
        .withMessage('postId không hợp lệ.'),

    // parentId optional
    body('parentId')
        .optional({ checkFalsy: true })
        .custom(value => mongoose.Types.ObjectId.isValid(value))
        .withMessage('parentId không hợp lệ.'),

    // userId bắt buộc
    body('userId')
        .notEmpty().withMessage('Thiếu userId.')
        .custom(value => mongoose.Types.ObjectId.isValid(value))
        .withMessage('userId không hợp lệ.'),

    // userName
    body('userName')
        .trim()
        .notEmpty().withMessage('Tên không được để trống.')
        .isLength({ min: 2, max: 100 })
        .withMessage('Tên phải từ 2–100 ký tự.')
        .escape(),

    // content
    body('content')
        .trim()
        .notEmpty().withMessage('Nội dung không được để trống.')
        .isLength({ min: 1, max: 500 })
        .withMessage('Nội dung tối đa 500 ký tự.')
        .custom(value => {
            // không cho HTML
            if (/<.*?>/.test(value)) {
                throw new Error('Không được chứa HTML.');
            }
            return true;
        })
];
