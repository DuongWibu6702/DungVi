module.exports = function sanitize(req, res, next) {
    const clean = (obj) => {
        if (!obj || typeof obj !== 'object') return;

        Object.keys(obj).forEach(key => {
            let value = obj[key];

            if (typeof value === 'string') {
                // Loại bỏ script tag & event handler
                value = value
                    .replace(/<script.*?>.*?<\/script>/gi, "")
                    .replace(/on\w+=/gi, "")
                    .replace(/javascript:/gi, "");

                obj[key] = value.trim();
            }

            if (typeof value === 'object') clean(value);
        });
    };

    clean(req.body);
    clean(req.query);
    clean(req.params);

    next();
};
