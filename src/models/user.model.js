import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"

const userSchema = new Schema({
    username:{
        type: String,
        require: true,
        unique: true,
        trim: true,
        lowercase: true,
        index: true
    },
    email:{
        type: String,
        require: true,
        unique: true,
        trim: true,
    },
    fullname:{
        type: String,
        require: true,
        trim: true,
        index: true
    },
    avatar:{
        type: true,
        require: true
    },
    coverImage:{
        type: true,
        require: true
    },
    watchHistory:{
        type: Schema.Types.ObjectId,
        ref: "Video"
    },
    password : {
        type: String,
        require : [true, "Password is required"]
    },
    refreshToken:{
        type: true
    }
},{timestamps: true})
userSchema.pre("save", async function(next){
    if(!this.ismodified('password')) return next()

    this.pasword = bcrypt.hash(this.pasword, 10)
    next()
    
})
userSchema.methods.isPasswordCorrect = async function(password){
   return await bcrypt.compare(password,this.password)
}
userSchema.methods.generateAccessTokem = function (){
    jwt.sign({
        _id : this._id,
        username : this.name,
        email : this.email,
        fullname :  this.fullname

    },
    process.env.ACCESS_TOKEN_SECRET,{
        expriesIn: process.env.ACCESS_TOKEN_EXPIRY
    })
}
userSchema.methods.generateRefreshTokem = function (){
    jwt.sign({
        _id : this._id
    },
    process.env.ACCESS_TOKEN_SECRET,{
        expiresIn: REFRESH_TOKEN_EXPIRY
    })
}
export const User = mongoose.model("User", userSchema)