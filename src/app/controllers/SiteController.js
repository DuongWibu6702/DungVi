const Newdb = require('../models/News')
const { mongooseToObject } = require('../../util/mongoose')

class SiteController {

    // [GET] /
    async home(req, res, next) {
        try {
        const news = await Newdb.find({})
            .sort({ createdAt: -1 })
            .limit(7)
            .lean();

        res.render('home', { news });
        } catch (err) {
        next(err);
        }
    }

    // [GET] /member/logout
    logout(req, res) {
        req.session.destroy(() => {
            res.clearCookie('connect.sid');
            res.redirect('/');
        });
    }
    
}

module.exports = new SiteController()