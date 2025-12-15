import mongoose from "mongoose";

const reply = new mongoose.Schema({
    ticketId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "HelpDeskTicket",
        required: true
    },
    responderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    message: {
        type: String,
        required: true
    },

}, { timestamps: true });

export default mongoose.model("TicketReply", reply)