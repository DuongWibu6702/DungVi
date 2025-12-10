const Newdb = require('../models/News');
const { mongooseToObject } = require('../../util/mongoose');

class SiteController {

    // [GET] /
    async home(req, res, next) {
        try {
            const news = await Newdb.find({})
                .sort({ createdAt: -1 })
                .limit(3)
                .lean();

            res.render('home', { 
                news,
                title: 'Quỹ học bổng Dung Vi',
                metaDescription: 'Trang chủ DungVi: Quỹ học bổng Dung Vi.'
            });
        } catch (err) {
            next(err);
        }
    }

    // [GET] /terms-of-service
    termsOfService(req, res) {
        res.render('terms-of-service', {
                title: 'Điều khoản sử dụng',
                metaDescription: 'Điều khoản sử dụng trang web Dung Vi'
            });
    }

    // [GET] /contact
    contact(req, res) {
        res.render('contact', {
                title: 'Liên hệ',
                metaDescription: 'Liên hệ trang web Dung Vi'
            });
    }

    // [GET] /about-us
    aboutUs(req, res) {
        res.render('about-us', {
                title: 'Giới thiệu',
                metaDescription: 'Giới thiệu trang web Dung Vi'
            });
    }

    // [GET] /member/logout
    logout(req, res) {
        req.session.destroy(() => {
            res.clearCookie('connect.sid');
            res.redirect('/');
        });
    }
}

module.exports = new SiteController();
