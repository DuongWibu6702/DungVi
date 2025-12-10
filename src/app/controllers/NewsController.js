const NewsService = require('../services/NewsService');
const CommentService = require('../services/CommentService');
const { mongooseToObject, multipleMongooseToObject } = require('../../util/mongoose');

class NewsController {

    // [GET] /news
    list(req, res, next) {
        const perPage = 10;
        const page = parseInt(req.query.page) || 1;

        NewsService.getPaginatedList(page, perPage)
            .then(([news, total]) => {
                res.render('user/news/index', {
                    newdb: multipleMongooseToObject(news),
                    current: page,
                    totalPages: Math.ceil(total / perPage),
                    user: req.session.user || null,
                    title: 'Tin tức | DungVi',
                    metaDescription: 'Tổng hợp tin tức, bài viết mới nhất được cập nhật từ Quỹ học bổng Dung Vi.',
                });
            })
            .catch(next);
    }

    // [GET] /news/:slug
    show(req, res, next) {
        const slug = req.params.slug;
        const user = req.session.user || null;

        let foundNews;

        NewsService.getNewsBySlug(slug)
            .then(news => {
                if (!news) {
                    return res.status(404).render('user/404', {
                        title: 'Không tìm thấy trang',
                        metaDescription: 'Trang bạn tìm kiếm không tồn tại.'
                    });
                }

                foundNews = news;
                return CommentService.getCommentsByPost(news._id);
            })
            .then(commentsTree => {
                res.render('user/news/show', {
                    newdb: mongooseToObject(foundNews),
                    commentsTree,
                    user,
                    title: foundNews.seoTitle,
                    metaDescription: foundNews.seoDescription,
                });
            })
            .catch(next);
    }
}

module.exports = new NewsController();
