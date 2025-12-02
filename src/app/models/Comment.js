const mongoose = require('mongoose');
const sanitizeHtml = require('sanitize-html');

const Schema = mongoose.Schema;

const CommentSchema = new Schema(
    {
        postId: { 
            type: Schema.Types.ObjectId, 
            ref: 'Newdb', 
            required: true 
        },

        parentId: { 
            type: Schema.Types.ObjectId, 
            default: null 
        },

        userId: { 
            type: Schema.Types.ObjectId, 
            ref: 'User', 
            required: true 
        },

        userName: { 
            type: String, 
            required: true, 
            trim: true,
            maxlength: 100
        },

        content: { 
            type: String, 
            required: true,
            trim: true,
            maxlength: 500,  // giới hạn content
            set: (value) => sanitizeHtml(value, {
                allowedTags: [],  // không cho HTML
                allowedAttributes: {}
            })
        }
    },
    { timestamps: true }
);

// Format name tránh XSS
CommentSchema.pre('save', function (next) {
    this.userName = sanitizeHtml(this.userName, {
        allowedTags: [],
        allowedAttributes: {}
    });
    next();
});

module.exports = mongoose.model('Comment', CommentSchema);
