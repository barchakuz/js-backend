// require('dotenv').config({path : './env'})

import dotenv from "dotenv"

import mongoose from "mongoose";
import { DATABASE_NAME } from "./constant.js";
import connectDB from "./db/index.js";

dotenv.config({
    path : './env'
})

connectDB()










/*
import express from express
const app = express()

;(async ()=>{
    try {
        await mongoose.connect(`${process.env.MONGOOSE_URI}/${DATABASE_NAME}`)
        app.on("ERROR", (error)=>{
            console.log("Error :", error);
            throw error
        })
        app.listen(process.env.PORT, ()=>{
            console.log(`App is listening to Port ${process.env.PORT}`);
        })
        
    } catch (error) {
        console.log("ERROR : Connection Fail with db", error);
        
    }
})()
*/