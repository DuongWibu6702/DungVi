module.exports = function nosqlSanitize(req, res, next) {
    const clean = (obj) => {
        if (!obj || typeof obj !== 'object') return;

        for (const key in obj) {
            const value = obj[key];

            // Nếu key bắt đầu bằng $ → xoá
            if (key.startsWith('$')) {
                delete obj[key];
                continue;
            }

            // Nếu value là object → tiếp tục clean
            if (typeof value === 'object') clean(value);
        }
    };

    clean(req.body);
    clean(req.query);
    clean(req.params);

    next();
};
