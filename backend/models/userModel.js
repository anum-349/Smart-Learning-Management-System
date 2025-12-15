import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    userName: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String },
    fatherName: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    dateOfBirth: { type: Date },
    joiningDate: { type: Date, required: true, default: Date.now },
    phone: { type: Number, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Prefer not to Say'], required: true },
    address: { type: String },
    cnic: { type: Number, required: true },
    profilePicture: { type: String },
    role: { type: String, enum: ["Student", "Instructor", "Admin"], required: true },
    registrationNo: { type: String, unique: true }
}, { timestamps: true });

userSchema.pre("save", async function (next) {
    if (!this.registrationNo) {
        let prefix = "";
        switch (this.role) {
            case "Student":
                prefix = "STUD";
                break;
            case "Instructor":
                prefix = "INST";
                break;
            case "Admin":
                prefix = "ADMN";
                break;
        }

        const lastUser = await mongoose.model("User")
            .findOne({ role: this.role })
            .sort({ createdAt: -1 });

        let lastNumber = 1000;
        if (lastUser && lastUser.registrationNo) {
            const matches = lastUser.registrationNo.match(/\d+$/);
            if (matches) lastNumber = parseInt(matches[0], 10);
        }

        this.registrationNo = `${prefix}-${lastNumber + 1}`;
    }
    next();
});

userSchema.pre("findOneAndDelete", async function (next) {
    const user = await this.model.findOne(this.getFilter());
    if (!user) return next();

    const userId = user._id;

    await mongoose.model("EventReminder").deleteMany({ userId });
    await mongoose.model("HelpDeskTicket").updateMany(
        { createdBy: userId },
        { $set: { createdBy: null } }
    );
    await mongoose.model("HelpDeskTicket").updateMany(
        { userId: userId },
        { $set: { userId: null } }
    );
    await mongoose.model("Message").deleteMany({ senderId: userId });
    await mongoose.model("MessageReply").deleteMany({ senderId: userId });
    await mongoose.model("Notification").deleteMany({ userId });
    await mongoose.model("Qualification").deleteMany({ userId });
    await mongoose.model("TicketReply").deleteMany({ responderId });

    if (user.role === "student") {

        await mongoose.model("AssignmentSubmission").deleteMany({ studentId: userId });
        await mongoose.model("AttendanceRecord").deleteMany({ studentId: userId });
        await mongoose.model("ExamResult").deleteMany({ studentId: userId });
        await mongoose.model("RegistrationRequest").deleteMany({ studentId });

        await mongoose.model("Grade").deleteMany({ studentId: userId });
        await mongoose.model("GradeReport").deleteMany({ studentId: userId });

        await mongoose.model("PerformanceAnalytics").deleteMany({ studentId: userId });
        await mongoose.model("QuizSubmission").deleteMany({ studentId: userId });
        await mongoose.model("StudentCourse").deleteMany({ studentId: userId });
    }

    if (user.role === "instructor") {

        await mongoose.model("Batch").deleteMany({ batchAdvisor: userId });
        await mongoose.model("CourseAssignment").deleteMany({ instructorId: userId });
        await mongoose.model("DocumentResources").deleteMany({ uploadedById: userId });

        await mongoose.model("Department").updateMany(
            { headOfDept: userId },
            { $set: { headOfDept: null } }
        );

        await mongoose.model("Faculty").updateMany(
            { dean: userId },
            { $set: { dean: null } }
        );
    }

    next();
});


export default mongoose.model("User", userSchema);
