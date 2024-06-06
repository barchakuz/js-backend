import { ayncHandler } from "../utils/asyncHandler.js";
import jwt from 'jsonwebtoken';
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiHandler.js";

const verifyJwt = ayncHandler(async(req, res, next)=>{
    try {
        const token = await req.cookies?.accessToken || req.header("Autherization")?.replace("Bearer ", "");
        if (!token) {
            throw new ApiError(401, "User Token not found")
        }
        const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user  = await User.findById(decodeToken._id).select("-password -refreshToken");
        if(!user){
            throw new ApiError(401, "Invalid User Access Token")
        }

        req.user = user;
        next()
        
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Access Token")
    }
})
export {verifyJwt}