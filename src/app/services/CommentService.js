const Comment = require('../models/Comment');
const mongoose = require('mongoose');

class CommentService {

    async getCommentsByPost(postId) {

        let comments = await Comment.find({ postId }).sort({ createdAt: 1 }).lean();

        comments.forEach(c => c.replies = []);

        const map = {};
        const roots = [];

        comments.forEach(c => {
            map[c._id] = c;
        });

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

    async createComment(data) {
        return Comment.create({
            postId: data.postId,
            parentId: null,
            content: data.content,
            userId: data.userId,
            userName: data.userName
        });
    }

    async createReply(data) {

        const parent = await Comment.findById(data.parentId).lean();
        if (!parent) {
            throw { msg: "Comment gốc không tồn tại." };
        }

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

    async getOne(id) {
        return Comment.findById(id);
    }

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
