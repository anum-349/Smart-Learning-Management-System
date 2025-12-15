import AttendanceRecord from "../models/attendanceRecordModel.js";
import AttendanceSession from "../models/attendanceSessionModel.js";
import User from "../models/userModel.js";

export const attendanceRate = async (req, res) => {
    try {
        const { studentId, courseAssignmentId } = req.params;

        const sessions = await AttendanceSession.find({ courseAssignmentId });
        const sessionIds = sessions.map(s => s._id);

        const records = await AttendanceRecord.find({
            studentId,
            sessionId: { $in: sessionIds }
        });

        const total = records.length;
        const present = records.filter(r => r.status === "Present" || r.status === "Late").length;

        const rate = total === 0 ? 0 : (present / total) * 100;

        res.status(200).json({
            studentId,
            courseAssignmentId,
            totalSessions: total,
            presentCount: present,
            attendanceRate: rate.toFixed(2) + "%"
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const monthlyReport = async (req, res) => {
    try {
        const { studentId, courseAssignmentId, month, year } = req.query;

        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0);

        const sessions = await AttendanceSession.find({
            courseAssignmentId,
            date: { $gte: start, $lte: end }
        });

        const sessionIds = sessions.map(s => s._id);

        const records = await AttendanceRecord.find({
            studentId,
            sessionId: { $in: sessionIds }
        });

        res.status(200).json({
            month,
            year,
            totalSessions: records.length,
            present: records.filter(r => r.status === "Present" || r.status === "Late").length,
            absent: records.filter(r => r.status === "Absent").length,
            records
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const lowAttendanceWarnings = async (req, res) => {
    try {
        const { courseAssignmentId } = req.params;

        const sessions = await AttendanceSession.find({ courseAssignmentId });
        const sessionIds = sessions.map(s => s._id);

        const studentRecords = await AttendanceRecord.find({ sessionId: { $in: sessionIds } });

        const studentList = [...new Set(studentRecords.map(r => r.studentId.toString()))];

        let warnings = [];

        for (let studentId of studentList) {
            const records = studentRecords.filter(r => r.studentId.toString() === studentId);
            const total = records.length;
            const present = records.filter(r => r.status !== "Absent").length;

            const rate = total === 0 ? 0 : (present / total) * 100;

            if (rate < 75) {
                const student = await User.findById(studentId).select("firstName lastName email");
                warnings.push({
                    studentId,
                    student,
                    attendanceRate: rate.toFixed(2),
                    message: "Attendance below 75%"
                });
            }
        }

        res.status(200).json({ warnings });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const courseAttendanceSummary = async (req, res) => {
    try {
        const { courseAssignmentId } = req.params;

        const sessions = await AttendanceSession.find({ courseAssignmentId }).sort("date");
        const sessionIds = sessions.map(s => s._id);

        const records = await AttendanceRecord.find({ sessionId: { $in: sessionIds } });

        let summary = [];

        for (let session of sessions) {
            const sessionRecords = records.filter(r => r.sessionId.toString() === session._id.toString());
            summary.push({
                sessionId: session._id,
                date: session.date,
                present: sessionRecords.filter(r => r.status !== "Absent").length,
                absent: sessionRecords.filter(r => r.status === "Absent").length
            });
        }

        res.status(200).json({ summary });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const studentHistory = async (req, res) => {
    try {
        const { studentId } = req.params;

        const records = await AttendanceRecord.find({ studentId })
            .populate({
                path: "sessionId",
                populate: { path: "courseAssignmentId", populate: ["courseId", "instructorId"] }
            });

        res.status(200).json(records);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
