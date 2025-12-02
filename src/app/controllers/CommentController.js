const CommentService = require('../services/CommentService');
const News = require('../models/News');
const mongoose = require('mongoose');

class CommentController {

    async create(req, res) {
        try {
            const user = req.session.user;
            if (!user) return res.status(401).send("Bạn phải đăng nhập");

            const postId = req.params.postId;

            // Validate ObjectId ngay tại controller
            if (!mongoose.Types.ObjectId.isValid(postId)) {
                return res.status(400).send("postId không hợp lệ");
            }

            const data = {
                postId,
                parentId: null,
                content: req.body.content,
                userId: user._id,
                userName: user.name
            };

            await CommentService.createComment(data);

            const news = await News.findById(postId).lean();
            if (!news) return res.redirect('/');

            return res.redirect(`/news/${news.slug}`);

        } catch (err) {
            return res.status(500).send(err.msg || err.message || "Lỗi hệ thống");
        }
    }

    async reply(req, res) {
        try {
            const user = req.session.user;
            if (!user) return res.status(401).send("Bạn phải đăng nhập");

            const postId = req.params.postId;
            const parentId = req.params.parentId;

            // Validate ObjectId ngay tại controller
            if (!mongoose.Types.ObjectId.isValid(postId) ||
                !mongoose.Types.ObjectId.isValid(parentId)) {
                return res.status(400).send("ID không hợp lệ");
            }

            const data = {
                postId,
                parentId,
                content: req.body.content,
                userId: user._id,
                userName: user.name
            };

            await CommentService.createReply(data);

            const news = await News.findById(postId).lean();
            if (!news) return res.redirect('/');

            return res.redirect(`/news/${news.slug}`);

        } catch (err) {
            return res.status(500).send(err.msg || err.message || "Lỗi hệ thống");
        }
    }

    async delete(req, res) {
        try {
            const user = req.session.user;
            if (!user) return res.status(401).send("Bạn không có quyền xoá");

            const id = req.params.id;

            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).send("ID comment không hợp lệ");
            }

            const comment = await CommentService.getOne(id);
            if (!comment) {
                return res.status(404).send("Comment không tồn tại");
            }

            // Xoá comment
            const deleted = await CommentService.deleteComment(id, user._id, user.role);
            if (!deleted) {
                return res.status(403).send("Bạn không có quyền xoá comment này");
            }

            const news = await News.findById(comment.postId).lean();
            if (!news) return res.redirect('/');

            return res.redirect(`/news/${news.slug}`);

        } catch (err) {
            return res.status(500).send(err.msg || err.message || "Lỗi hệ thống");
        }
    }
}

module.exports = new CommentController();
