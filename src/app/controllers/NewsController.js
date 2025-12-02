const NewsService = require('../services/NewsService');
const CommentService = require('../services/CommentService');
const { mongooseToObject, multipleMongooseToObject } = require('../../util/mongoose');

class NewsController {

    // [GET] /news?page=
    list(req, res, next) {
        const perPage = 10;
        const page = parseInt(req.query.page) || 1;

        NewsService.getPaginatedList(page, perPage)
            .then(([news, total]) => {
                res.render('user/news/index', {
                    newdb: multipleMongooseToObject(news),   // news vẫn là Mongoose → convert được
                    current: page,
                    totalPages: Math.ceil(total / perPage),
                    user: req.session.user || null
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
                if (!news) return res.status(404).render('user/404');
                foundNews = news;

                // CommentService đã trả về object []
                return CommentService.getCommentsByPost(news._id);
            })
            .then(commentsTree => {

                res.render('user/news/show', {
                    newdb: mongooseToObject(foundNews),
                    commentsTree,            // <-- dùng trực tiếp, KHÔNG convert lại
                    user
                });
            })
            .catch(next);
    }
}

module.exports = new NewsController();
