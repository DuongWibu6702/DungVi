const Newdb = require('../models/News')
const { mongooseToObject } = require('../../util/mongoose')

class SiteController {

    // [GET] /
    index(req, res, next) {
        res.render('user/home')
    }
    
}

module.exports = new SiteController()