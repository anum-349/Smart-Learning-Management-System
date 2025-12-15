import mongoose from "mongoose";

const calendar = new mongoose.Schema({
    type: {
        type: String,
        enum: ["Assignment", "Quiz", "Exam", "Class"],
        required: true
    },
    dateTime: {
        type: Date,
        required: true
    }, 
    classRoom: {
        type: String,
        default: ""
    },
}, { timestamps: true });

calendarSchema.pre("findOneAndDelete", async function(next) {
    const calendarEvent = await this.model.findOne(this.getFilter());
    if (!calendarEvent) return next();

    const eventId = calendarEvent._id;

    await mongoose.model("EventReminder").deleteMany({ eventId });

    next();
});

export default mongoose.model("CalendarEvent", calendar)