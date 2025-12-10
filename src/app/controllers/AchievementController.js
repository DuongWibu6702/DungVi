const AchievementService = require('../services/AchievementService');
const Member = require('../models/Members');
const { ObjectId } = require('mongodb');
const subjects = require('../constants/subjects');

class AchievementController {
    // [GET] /member/achievements/add
    async addForm(req, res) {
        return res.render("member/achievements/add", { subjects });
    }

    // [POST] /member/achievements/add
    async add(req, res) {
        try {
            const memberId = req.session?.user?._id;

            if (!memberId) {
                return res.redirect("/member/login");
            }

            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

            const submitTimes = await Member.aggregate([
                { $match: { _id: new ObjectId(memberId) } },
                { $unwind: "$achievements" },
                { $match: { "achievements.createdAt": { $gte: sixMonthsAgo } } },
                { $group: { _id: "$achievements.submissionId" } },
                { $count: "times" }
            ]);

            const times = submitTimes.length ? submitTimes[0].times : 0;

            if (times >= 2) {
                return res.render("member/achievements/add", {
                    error: "Bạn chỉ được nộp tối đa 2 lần trong 6 tháng gần đây.",
                    subjects
                });
            }

            const { schoolYear, semester, subject, score } = req.body;
            const fileInfo = req.uploadedFile;

            if (!Array.isArray(subject) || subject.length === 0) {
                return res.render("member/achievements/add", {
                    error: "Chưa nhập môn học.",
                    subjects
                });
            }

            const submissionId = new ObjectId();
            const now = new Date();

            const achievements = subject.map((subj, i) => ({
                submissionId,
                schoolYear: Number(schoolYear),
                semester: Number(semester),
                subject: subj,
                score: Number(score[i]),
                approved: false,
                file: fileInfo.url,
                fileType: fileInfo.type,
                createdAt: now
            }));

            await AchievementService.addMany(memberId, achievements);

            return res.render("member/achievements/add", {
                success: "Đã gửi điểm lên quản trị viên.",
                subjects
            });

        } catch (e) {
            console.error(e);
            return res.render("member/achievements/add", {
                error: "Có lỗi xảy ra.",
                subjects
            });
        }
    }
}

module.exports = new AchievementController();
