const Newdb = require('../models/News');
const path = require('path');
const fsExtra = require('fs-extra');

class AuthorService {

    getStoredNews() {
        return Promise.all([
            Newdb.find({}),
            Newdb.countDocumentsDeleted()
        ]);
    }

    getTrashNews() {
        return Newdb.findDeleted({});
    }

    // Tạo bài viết mới
    async createNews(formData, file) {
        const newdb = new Newdb({
            name: formData.name,
            description: formData.description,
            body: formData.body,
            author: formData.author,
            source: formData.source || "",
            images: []
        });

        await newdb.save();

        const idFolder = newdb._id.toString();
        const uploadFolder = path.join(__dirname, '../../public/uploads', idFolder);
        fsExtra.ensureDirSync(uploadFolder);

        // Thumbnail
        if (file) {
            const safeFilename = path.basename(file.filename);
            const thumbSrc = file.path;
            const thumbDest = path.join(uploadFolder, safeFilename);

            fsExtra.moveSync(thumbSrc, thumbDest, { overwrite: true });
            newdb.thumbnail = `/uploads/${idFolder}/${safeFilename}`;
        }

        // Chuyển ảnh từ tmp sang folder bài viết
        if (formData.tmpFolder) {
            const safeTmp = path.basename(formData.tmpFolder);
            const tmpPath = path.join(__dirname, '../../public/uploads/tmp', safeTmp);

            if (fsExtra.existsSync(tmpPath)) {
                fsExtra.moveSync(tmpPath, uploadFolder, { overwrite: true });

                if (newdb.body) {
                    newdb.body = newdb.body.replace(
                        new RegExp(`/uploads/tmp/${safeTmp}`, 'g'),
                        `/uploads/${idFolder}`
                    );
                }
            }
        }

        return newdb.save();
    }

    getNewsById(id) {
        return Newdb.findById(id);
    }

    // Cập nhật bài viết
    async updateNews(id, formData, file) {
        const newdb = await Newdb.findById(id);
        if (!newdb) throw new Error("Not found");

        const idFolder = newdb._id.toString();
        const uploadFolder = path.join(__dirname, '../../public/uploads', idFolder);
        fsExtra.ensureDirSync(uploadFolder);

        // Thumbnail mới
        if (file) {
            const safeFilename = path.basename(file.filename);
            const thumbSrc = file.path;
            const thumbDest = path.join(uploadFolder, safeFilename);

            // Xoá thumbnail cũ
            if (newdb.thumbnail) {
                const oldThumb = path.join(__dirname, '../../public', newdb.thumbnail);
                if (fsExtra.existsSync(oldThumb)) fsExtra.removeSync(oldThumb);
            }

            fsExtra.moveSync(thumbSrc, thumbDest, { overwrite: true });
            newdb.thumbnail = `/uploads/${idFolder}/${safeFilename}`;
        }

        // Chuyển ảnh tmp sang folder chính
        if (formData.tmpFolder) {
            const safeTmp = path.basename(formData.tmpFolder);
            const tmpPath = path.join(__dirname, '../../public/uploads/tmp', safeTmp);

            if (fsExtra.existsSync(tmpPath)) {
                fsExtra.moveSync(tmpPath, uploadFolder, { overwrite: true });

                if (formData.body) {
                    formData.body = formData.body.replace(
                        new RegExp(`/uploads/tmp/${safeTmp}`, 'g'),
                        `/uploads/${idFolder}`
                    );
                }
            }
        }

        // Cập nhật dữ liệu (chỉ update field có gửi lên)
        if (formData.name) newdb.name = formData.name;
        if (formData.description) newdb.description = formData.description;
        if (formData.body) newdb.body = formData.body;
        if (formData.author) newdb.author = formData.author;

        // Source: nếu form gửi chuỗi rỗng → giữ nguyên
        if (typeof formData.source === "string") {
            newdb.source = formData.source.trim() !== "" 
                ? formData.source 
                : newdb.source;
        }

        return newdb.save();
    }

    // Clone bài viết
    async cloneNews(id) {
        const original = await Newdb.findById(id);
        if (!original) throw new Error("Không tìm thấy bài viết");

        const clone = new Newdb({
            name: original.name + " (Clone)",
            thumbnail: original.thumbnail,
            description: original.description,
            body: original.body,
            author: original.author,
            source: original.source,
            images: [...(original.images || [])]
        });

        await clone.save();

        const oldId = original._id.toString();
        const newId = clone._id.toString();

        const oldFolder = path.join(__dirname, '../../public/uploads', oldId);
        const newFolder = path.join(__dirname, '../../public/uploads', newId);

        fsExtra.ensureDirSync(newFolder);

        // Sao chép toàn bộ thư mục ảnh
        if (fsExtra.existsSync(oldFolder)) {
            fsExtra.copySync(oldFolder, newFolder);
        }

        // Cập nhật lại đường dẫn ảnh
        if (clone.thumbnail) {
            clone.thumbnail = clone.thumbnail.replace(oldId, newId);
        }

        if (Array.isArray(clone.images)) {
            clone.images = clone.images.map(img =>
                img.replace(`/uploads/${oldId}`, `/uploads/${newId}`)
            );
        }

        if (clone.body) {
            clone.body = clone.body.replace(
                new RegExp(`/uploads/${oldId}`, 'g'),
                `/uploads/${newId}`
            );
        }

        return clone.save();
    }

    // Xoá mềm
    softDelete(id) {
        return Newdb.delete({ _id: id });
    }

    // Khôi phục
    restore(id) {
        return Newdb.restore({ _id: id });
    }

    // Xoá vĩnh viễn
    forceDelete(id) {
        const folder = path.join(__dirname, '../../public/uploads', id.toString());
        if (fsExtra.existsSync(folder)) fsExtra.removeSync(folder);

        return Newdb.deleteOne({ _id: id });
    }
}

module.exports = new AuthorService();
