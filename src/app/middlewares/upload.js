const multer = require('multer');
const fsExtra = require('fs-extra');
const path = require('path');
const sharp = require('sharp');

// Danh sách MIME được phép
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

function uploadTmp(tmpFolder, maxWidth = 1200) {
    const safeTmp = path.basename(tmpFolder);
    const destPath = path.join(__dirname, '../../public/uploads/tmp', safeTmp);

    fsExtra.mkdirpSync(destPath);

    // Dùng memoryStorage để tránh xung đột input/output
    const upload = multer({
        storage: multer.memoryStorage(),
        fileFilter: (req, file, cb) => {
            if (!ALLOWED.includes(file.mimetype)) {
                return cb(new Error("Chỉ hỗ trợ file ảnh"), false);
            }
            cb(null, true);
        }
    }).single("image");

    return (req, res, next) => {
        upload(req, res, async (err) => {

            if (err) return next(err);
            if (!req.file) return next(new Error("Không có file upload"));

            try {
                // Tạo tên file đích (luôn sinh file mới)
                const filename = Date.now() + ".webp";
                const outputPath = path.join(destPath, filename);

                // Resize + convert sang WebP
                await sharp(req.file.buffer)
                    .resize({ width: maxWidth })
                    .webp({ quality: 85 })
                    .toFile(outputPath);

                // Ghi thông tin file mới vào req để Controller sử dụng
                req.uploadedFile = {
                    filename,
                    url: `/uploads/tmp/${safeTmp}/${filename}`
                };

                return next();

            } catch (e) {
                console.error(e);
                return next(new Error("Xử lý ảnh thất bại"));
            }
        });
    };
}

module.exports = uploadTmp;
