module.exports = function imageFileCheck(req, res, next) {
    if (!req.file) return next();

    const file = req.file;
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    if (!allowed.includes(file.mimetype)) {
        return res.status(400).json({ success: false, message: 'Chỉ chấp nhận ảnh (jpeg,png,webp,gif)' });
    }

    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
        return res.status(400).json({ success: false, message: 'Kích thước ảnh tối đa 5MB' });
    }

    next();
};
