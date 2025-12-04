const newsRouter = require('./news');
const commentRouter = require('./comment');
const uploadRoute = require('./upload');
const adminRouter = require('./admin');
const authorRouter = require('./author');
const memberRouter = require('./member');
const siteRouter = require('./site');

function route(app) {
    app.use('/news', newsRouter)
    app.use('/comments', commentRouter)
    app.use('/upload', uploadRoute)
    app.use('/admin', adminRouter)
    app.use('/author', authorRouter)
    app.use('/member', memberRouter)
    app.use('/', siteRouter)
}

module.exports = route;
