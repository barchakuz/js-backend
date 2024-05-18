
import mongoose from "mongoose";
import express from "express";
import { DATABASE_NAME } from "../constant.js";

const connectDB = async () => {
    try {
        await mongoose.connect(`${process.env.MONGOOSE_URI}/${DATABASE_NAME}`)
        console.log("Database conneted");
        // console.log(`\n Mongoose Connected Pass ${connectionIntance.connection.host}`);
    } catch (error) {
        console.log("ERROR Mongoose connection failed", error);
        process.exit(1);
        
    }
}
export default connectDB;