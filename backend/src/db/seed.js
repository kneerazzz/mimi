import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import { MONGO_URL } from "../config/env.js";
import { Template } from "../models/template.model.js";
import initialTemplates from "./templateSeeder.js";


const seedDB = async () => {
    try {
        await mongoose.connect(`${MONGO_URL}/${DB_NAME}`);
        console.log("Database connected for seeding");

        await Template.deleteMany({});
        console.log("Cleared existing templates");

        await Template.insertMany(initialTemplates);
        console.log("Seeded new templates");

    } catch (error) {
        console.error("Error seeding database:", error);
    } finally {
        mongoose.connection.close();
        console.log("Database connection closed");
    }
}

seedDB();
