module.exports = {

    /* ---------------------------------------------
       YÊU CẦU LOGIN (mọi user đã đăng nhập)
    --------------------------------------------- */
    requireLogin(req, res, next) {
        const user = req.session?.user || req.session?.admin;

        if (!user) return res.redirect('/login');
        next();
    },

    /* ---------------------------------------------
       YÊU CẦU ADMIN
       - Ưu tiên session.admin
       - Nếu login bằng user thường thì phải role=admin
    --------------------------------------------- */
    requireAdmin(req, res, next) {

        // Nếu đăng nhập qua admin login
        if (req.session.admin) return next();

        // Nếu đăng nhập bằng user
        const user = req.session.user;
        if (!user) return res.redirect('/login');

        if (user.role !== 'admin') return res.redirect('/');

        next();
    },

    /* ---------------------------------------------
       YÊU CẦU AUTHOR (hoặc admin)
    --------------------------------------------- */
    requireAuthor(req, res, next) {
        const user = req.session?.user;

        if (!user) return res.redirect('/login');

        if (user.role === 'admin') return next();
        if (user.role === 'author') return next();

        return res.redirect('/');
    },

    /* ---------------------------------------------
       YÊU CẦU MEMBER (trở lên)
       - login = ok
    --------------------------------------------- */
    requireMember(req, res, next) {
        const user = req.session?.user;

        if (!user) return res.redirect('/login');

        const roles = ['admin', 'author', 'member'];
        if (roles.includes(user.role)) return next();

        return res.redirect('/');
    }
};
