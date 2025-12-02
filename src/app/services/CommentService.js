const Comment = require('../models/Comment');
const mongoose = require('mongoose');

class CommentService {

    /*
    |--------------------------------------------------------------------------
    | Lấy comment theo bài viết + build comment tree
    |--------------------------------------------------------------------------
    */
    async getCommentsByPost(postId) {

        // Dùng lean để hiệu năng tốt hơn
        let comments = await Comment.find({ postId }).sort({ createdAt: 1 }).lean();

        // Gán replies mặc định
        comments.forEach(c => c.replies = []);

        const map = {};
        const roots = [];

        // Tạo map nhanh
        comments.forEach(c => {
            map[c._id] = c;
        });

        // Build cây
        comments.forEach(c => {
            if (c.parentId) {
                if (map[c.parentId]) {
                    map[c.parentId].replies.push(c);
                }
            } else {
                roots.push(c);
            }
        });

        return roots;
    }

    /*
    |--------------------------------------------------------------------------
    | Tạo comment gốc
    |--------------------------------------------------------------------------
    |  - postId được validate ở Validator
    |  - userId / userName lấy từ session (controller set)
    |--------------------------------------------------------------------------
    */
    async createComment(data) {
        return Comment.create({
            postId: data.postId,
            parentId: null,
            content: data.content,
            userId: data.userId,
            userName: data.userName
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Tạo reply comment (nested)
    |--------------------------------------------------------------------------
    | Kiểm tra:
    | - parentId hợp lệ
    | - parent comment phải thuộc đúng postId
    |--------------------------------------------------------------------------
    */
    async createReply(data) {

        // Kiểm tra parent có tồn tại
        const parent = await Comment.findById(data.parentId).lean();
        if (!parent) {
            throw { msg: "Comment gốc không tồn tại." };
        }

        // Kiểm tra parent có thuộc đúng post
        if (String(parent.postId) !== String(data.postId)) {
            throw { msg: "Reply không hợp lệ (parent thuộc bài khác)." };
        }

        return Comment.create({
            postId: data.postId,
            parentId: data.parentId,
            content: data.content,
            userId: data.userId,
            userName: data.userName
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Lấy 1 comment
    |--------------------------------------------------------------------------
    */
    async getOne(id) {
        return Comment.findById(id);
    }

    /*
    |--------------------------------------------------------------------------
    | Xóa comment
    |--------------------------------------------------------------------------
    | - Member chỉ xóa comment của chính họ
    | - Admin xóa mọi comment
    | - Xóa luôn comment con (replies)
    |--------------------------------------------------------------------------
    */
    async deleteComment(id, userId, role) {

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw { msg: "ID comment không hợp lệ" };
        }

        let target;

        if (role === "admin") {
            target = await Comment.findById(id);
        } else {
            target = await Comment.findOne({ _id: id, userId });
        }

        if (!target) {
            return null;
        }

        // Xoá comment + reply
        await Comment.deleteMany({
            $or: [
                { _id: id },
                { parentId: id }
            ]
        });

        return true;
    }
}

module.exports = new CommentService();
