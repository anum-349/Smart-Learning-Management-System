import mongoose from "mongoose";

const replySchema = new mongoose.Schema({
    messageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
        required: true
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    content: {
        type: String,
        required: true
    },
    replyAt: {
        type: Date,
        default: Date.now
    },
}, { timestamps: true }); 
export default mongoose.model("Reply", replySchema);
