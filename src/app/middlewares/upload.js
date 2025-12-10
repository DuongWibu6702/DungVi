const multer = require('multer');
const fsExtra = require('fs-extra');
const path = require('path');
const sharp = require('sharp');

const ALLOWED_IMAGES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
const ALLOWED_PDF = ["application/pdf"];

function uploadTmp(tmpFolder, maxWidth = 1200) {
    const safeTmp = path.basename(tmpFolder);
    const destPath = path.join(__dirname, '../../public/uploads/tmp', safeTmp);

    fsExtra.mkdirpSync(destPath);

    const upload = multer({
        storage: multer.memoryStorage(),
        fileFilter: (req, file, cb) => {
            const { mimetype } = file;
            if (![...ALLOWED_IMAGES, ...ALLOWED_PDF].includes(mimetype)) {
                return cb(new Error("Chỉ hỗ trợ ảnh hoặc PDF"), false);
            }
            cb(null, true);
        }
    }).single("image");

    return (req, res, next) => {
        upload(req, res, async (err) => {
            if (err) return next(err);
            if (!req.file) return next(new Error("Không có file upload"));

            const fileMime = req.file.mimetype;

            try {
                let filename;
                let outputPath;

                if (ALLOWED_PDF.includes(fileMime)) {
                    filename = Date.now() + ".pdf";
                    outputPath = path.join(destPath, filename);

                    await fsExtra.writeFile(outputPath, req.file.buffer);

                    req.uploadedFile = {
                        filename,
                        url: `/uploads/tmp/${safeTmp}/${filename}`,
                        type: "pdf"
                    };
                }

                else if (ALLOWED_IMAGES.includes(fileMime)) {
                    filename = Date.now() + ".webp";
                    outputPath = path.join(destPath, filename);

                    await sharp(req.file.buffer)
                        .resize({ width: maxWidth })
                        .webp({ quality: 85 })
                        .toFile(outputPath);

                    req.uploadedFile = {
                        filename,
                        url: `/uploads/tmp/${safeTmp}/${filename}`,
                        type: "image"
                    };
                }

                return next();

            } catch (e) {
                console.error(e);
                return next(new Error("Xử lý file thất bại"));
            }
        });
    };
}

module.exports = uploadTmp;
