import mongoose from "mongoose";

const help = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    status: {
        type: String,
        enum: ["resolved", "pending"],
        default: "pending"
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
}, { timestamps: true });

help.pre("findOneAndDelete", async function (next) {
    try {
        const ticket = await this.model.findOne(this.getFilter());
        if (!ticket) return next();

        await mongoose.model("TicketReply")
            .deleteMany({ ticketId: ticket._id });

        next();
    } catch (err) {
        next(err);
    }
});
export default mongoose.model("HelpDeskTicket", help)