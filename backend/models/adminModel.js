import mongoose from "mongoose";
import User from "./userModel.js"

const schema = new mongoose.Schema({
    status: {
        type: String,
        enum: ['Active', 'InActive'],
        default: "Active"
    },
}, { timestamps: true });

const Admin = User.discriminator("Admin", schema);
export default Admin;