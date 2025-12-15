import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connect = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log("DB connected.")
    } catch( err ){
        console.warn({Message: err});
        process.exit(1);
    }
    
}

export default connect;