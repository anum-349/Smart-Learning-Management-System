import mongoose from "mongoose";

const msg = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    content: {
        type: String,
        required: true
    },
    sentAt: {
        type: Date,
        default: Date.now
    },
}, { timestamps: true }); 

msg.pre("findOneAndDelete", async function (next) {
    try {
        const message = await this.model.findOne(this.getFilter());
        if (!message) return next();

        await mongoose.model("MessageReply")
            .deleteMany({ messageId: message._id });

        next();
    } catch (err) {
        next(err);
    }
});

export default mongoose.model("Message", msg)