module.exports = {
    requireLogin(req, res, next) {
        const user = req.session?.user || req.session?.admin;
        if (!user) return res.redirect('/member/login');

        next();
    },

    requireAdmin(req, res, next) {
        const user = req.session?.user;
        if (!user) return res.redirect('/member/login');

        const allowed = ["Admin"];
        if (allowed.includes(user.type)) return next();

        return res.redirect('/');
    },

    requireAuthor(req, res, next) {
        const user = req.session?.user;
        if (!user) return res.redirect('/member/login');

        const allowed = ["Admin", "Author"];
        if (allowed.includes(user.type)) return next();

        return res.redirect('/');
    },

    requireMember(req, res, next) {
        const user = req.session?.user;
        if (!user) return res.redirect('/member/login');

        const allowed = ["Admin", "Author", "Member"];
        if (allowed.includes(user.type)) return next();

        return res.redirect('/');
    }
};
