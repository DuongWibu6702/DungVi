const newsRouter = require('./news');
const commentRouter = require('./comment');
const uploadRoute = require('./upload');
const authRouter = require('./user');
const adminRouter = require('./admin');
const authorRouter = require('./author');
const siteRouter = require('./site');

function route(app) {
    app.use('/news', newsRouter)
    app.use('/comments', commentRouter)
    app.use('/upload', uploadRoute)
    app.use('/user', authRouter)
    app.use('/admin', adminRouter)
    app.use('/author', authorRouter)
    app.use('/', siteRouter)
}

module.exports = route;
