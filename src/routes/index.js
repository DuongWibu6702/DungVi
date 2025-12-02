const newsRouter = require('./news');
const commentRouter = require('./comment');
const uploadRoute = require('./upload');
const adminRouter = require('./admin');
const authorRouter = require('./author');
const userRouter = require('./user');
const siteRouter = require('./site');

function route(app) {
    app.use('/news', newsRouter)
    app.use('/comments', commentRouter)
    app.use('/upload', uploadRoute)
    app.use('/admin', adminRouter)
    app.use('/author', authorRouter)
    app.use('/user', userRouter)
    app.use('/', siteRouter)
}

module.exports = route;
