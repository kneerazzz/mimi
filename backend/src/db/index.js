import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import { MONGO_URL } from "../config/env.js";


const connectDB = async () => {
    try {
        mongoose.set("autoIndex", false);
        const connectionInstance = await mongoose.connect(`${MONGO_URL}/${DB_NAME}`, {
            autoIndex: false
        });
        console.log(`\n MongoDb connected || DB HOST: ${connectionInstance.connection.host}`)
    } catch (error) {
        console.log("mongodb connection error", error);
        process.exit(1)
    }
}

export default connectDB;