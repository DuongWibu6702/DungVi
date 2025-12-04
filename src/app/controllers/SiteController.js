const Newdb = require('../models/News')
const { mongooseToObject } = require('../../util/mongoose')

class SiteController {

    // [GET] /
    index(req, res, next) {
        res.render('home')
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