const uploadTmp = require('../middlewares/upload');

class UploadService {
    uploadTmp(req) {
        return new Promise((resolve, reject) => {
            const folder = req.params.tmpFolder;

            uploadTmp(folder)(req, {}, (err) => {
                if (err) return reject(err);

                if (!req.uploadedFile) {
                    return reject(new Error("Upload thất bại"));
                }

                resolve(req.uploadedFile.url);
            });
        });
    }
}

module.exports = new UploadService();
