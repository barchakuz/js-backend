// require('dotenv').config({path : './env'})
import dotenv from "dotenv"
import mongoose from "mongoose";
import { DATABASE_NAME } from "./constant.js";
import connectDB from "./db/index.js";
import { app } from "./app.js";


dotenv.config({
    path : './env'
})

connectDB().then(()=>{
    app.listen(process.env.PORT || 8000 , console.log(`Server is running at Port :  ${process.env.PORT}`))
}).catch((error)=>{
    console.log("Mongo db connect failed", error);
})












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