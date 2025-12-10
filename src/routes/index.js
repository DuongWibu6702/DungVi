const newsRouter = require('./news');
const commentRouter = require('./comment');
const uploadRoute = require('./upload');
const adminRouter = require('./admin');
const adminAchievementsRouter = require('./adminAchievements');
const authorRouter = require('./author');
const memberRouter = require('./member');
const achievementRouter = require('./achievement');
const rankingRouter = require('./ranking');
const profileRouter = require('./profile');
const siteRouter = require('./site');

function route(app) {
    app.use('/news', newsRouter)
    app.use('/comments', commentRouter)
    app.use('/upload', uploadRoute)
    app.use('/admin', adminRouter)
    app.use("/admin/achievements", adminAchievementsRouter);
    app.use('/author', authorRouter)
    app.use('/member', memberRouter)
    app.use('/member/achievements', achievementRouter)
    app.use('/ranking', rankingRouter);
    app.use('/', profileRouter);
    app.use('/', siteRouter)
}

module.exports = route;
