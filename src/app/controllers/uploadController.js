const UploadService = require('../services/Upload');

class UploadController {
    async uploadTmp(req, res) {
        try {
            const url = await UploadService.uploadTmp(req);
            res.json({ url });
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
}

module.exports = new UploadController();
