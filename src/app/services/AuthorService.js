const bcrypt = require('bcryptjs');
const User = require('../models/Users');
const Author = require('../models/Authors');
const Newdb = require('../models/News');
const fsExtra = require('fs-extra');
const path = require('path');

function normalizeEmail(email) {
    return String(email || "").trim().toLowerCase();
}

class AuthorService {

    async registerAuthor(name, email, password) {
        const normEmail = normalizeEmail(email);
        const exists = await User.findOne({ email: normEmail });
        if (exists) throw new Error("Email đã tồn tại.");

        const author = new Author({
            name,
            email: normEmail,
            password,
            active: false
        });

        await author.save();
        return author;
    }

    async loginAuthor(email, password) {
        const norm = normalizeEmail(email);
        const author = await Author.findOne({ email: norm });

        if (!author) throw new Error("Email không tồn tại.");
        if (!author.active) throw new Error("Tài khoản chưa được Admin duyệt.");

        const match = await author.comparePassword(password);
        if (!match) throw new Error("Mật khẩu không đúng.");

        return author;
    }

    async getById(id) {
        return User.findById(id).lean();
    }

    async updateProfile(id, name, email, verifyPassword) {
        const user = await User.findById(id);
        if (!user) throw new Error("Không tìm thấy tài khoản.");

        const match = await user.comparePassword(verifyPassword);
        if (!match) throw new Error("Mật khẩu xác nhận không đúng.");

        const normEmail = normalizeEmail(email);
        const exists = await User.findOne({ email: normEmail, _id: { $ne: id } });
        if (exists) throw new Error("Email đã tồn tại.");

        user.name = name.trim();
        user.email = normEmail;

        await user.save();
        return user.toObject();
    }

    async updatePassword(id, oldPassword, newPassword, confirmPassword) {
        if (newPassword !== confirmPassword) {
            throw new Error("Mật khẩu nhập lại không trùng khớp.");
        }

        const user = await User.findById(id);
        if (!user) throw new Error("Không tìm thấy tài khoản.");

        const match = await user.comparePassword(oldPassword);
        if (!match) throw new Error("Mật khẩu hiện tại không đúng.");

        const hashed = await bcrypt.hash(newPassword, 10);
        user.password = hashed;

        await user.save();
        return { message: "Đổi mật khẩu thành công." };
    }

    getStoredNews() {
        return Promise.all([
            Newdb.find({}),
            Newdb.countDocumentsDeleted()
        ]);
    }

    getTrashNews() {
        return Newdb.findDeleted({});
    }

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

        if (file) {
            const safeFilename = path.basename(file.filename);
            fsExtra.moveSync(file.path, path.join(uploadFolder, safeFilename), { overwrite: true });
            newdb.thumbnail = `/uploads/${idFolder}/${safeFilename}`;
        }

        if (formData.tmpFolder) {
            const safeTmp = path.basename(formData.tmpFolder);
            const tmpPath = path.join(__dirname, '../../public/uploads/tmp', safeTmp);

            if (fsExtra.existsSync(tmpPath)) {
                fsExtra.moveSync(tmpPath, uploadFolder, { overwrite: true });

                newdb.body = newdb.body.replace(
                    new RegExp(`/uploads/tmp/${safeTmp}`, 'g'),
                    `/uploads/${idFolder}`
                );
            }
        }

        return newdb.save();
    }

    getNewsById(id) {
        return Newdb.findById(id);
    }

    async updateNews(id, formData, file) {
        const newdb = await Newdb.findById(id);
        if (!newdb) throw new Error("Không tìm thấy bài viết");

        const idFolder = newdb._id.toString();
        const uploadFolder = path.join(__dirname, '../../public/uploads', idFolder);
        fsExtra.ensureDirSync(uploadFolder);

        if (file) {
            const safeFilename = path.basename(file.filename);

            if (newdb.thumbnail) {
                const oldThumbPath = path.join(__dirname, '../../public', newdb.thumbnail);
                if (fsExtra.existsSync(oldThumbPath)) fsExtra.removeSync(oldThumbPath);
            }

            fsExtra.moveSync(file.path, path.join(uploadFolder, safeFilename), { overwrite: true });
            newdb.thumbnail = `/uploads/${idFolder}/${safeFilename}`;
        }

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

        if (formData.name) newdb.name = formData.name;
        if (formData.description) newdb.description = formData.description;
        if (formData.body) newdb.body = formData.body;
        if (formData.author) newdb.author = formData.author;
        if (formData.source) newdb.source = formData.source;

        return newdb.save();
    }

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

        if (fsExtra.existsSync(oldFolder)) {
            fsExtra.copySync(oldFolder, newFolder);
        }

        if (clone.thumbnail) clone.thumbnail = clone.thumbnail.replace(oldId, newId);

        if (clone.images) {
            clone.images = clone.images.map(img => img.replace(oldId, newId));
        }

        if (clone.body) {
            clone.body = clone.body.replace(
                new RegExp(`/uploads/${oldId}`, 'g'),
                `/uploads/${newId}`
            );
        }

        return clone.save();
    }

    softDelete(id) {
        return Newdb.delete({ _id: id });
    }

    restore(id) {
        return Newdb.restore({ _id: id });
    }

    forceDelete(id) {
        const folder = path.join(__dirname, '../../public/uploads', id.toString());

        if (fsExtra.existsSync(folder)) fsExtra.removeSync(folder);

        return Newdb.deleteOne({ _id: id });
    }
}

module.exports = new AuthorService();
