const PERMISSIONS = {
    Admin: ["Admin", "Author", "Member"],
    Author: ["Author", "Member"],
    Member: ["Member"]
};

module.exports = function authorize(requiredType) {
    return (req, res, next) => {
        const userType = req.user?.type;

        if (!userType) {
            return res.status(401).json({ msg: "Unauthorized" });
        }

        const allowed = PERMISSIONS[userType];

        if (!allowed || !allowed.includes(requiredType)) {
            return res.status(403).json({ msg: "Forbidden" });
        }

        next();
    };
};
