import {ayncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiHandler.js";
import {User} from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudnary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";


const registerUser = ayncHandler( async (req, res)=>{
   const {fullname, email, username, passowrd} = req.body;
   
   if ([fullname, email, username, passowrd].some((field)=> (field?.trim === ""))){
       throw new ApiError(400, "All fields requries") 
   }
   const existedUser = await User.findOne({
    $or : [{username}, {email}]
   })

   if(existedUser){
    throw new ApiError(400, "Username and Password exists")
   }

  const localAvatarPath =   req.files?.avatar[0]?.path;
  const localcoverImagePath =  req.files?.coverImage[0]?.path;

 console.log(localAvatarPath, localcoverImagePath);
  if(!localAvatarPath){
    throw new ApiError(400, "Avatar Image not Found")
  }

  if(!localcoverImagePath){
    throw new ApiError(400, "coverImage not Found")
  }


const avatar = await uploadOnCloudinary(localAvatarPath);
const coverImage = await uploadOnCloudinary(localcoverImagePath);
console.log(avatar);

if(!avatar){
    throw new ApiError(400, "Avator Not found!!")
}

if(!coverImage){
    throw new ApiError(400, "coverImage Not found!!")
}

const user = await User.create({
    fullname,
    username: username.toLowerCase(),
    email,
    passowrd,
    avatar: avatar.url,
    coverImage : coverImage.url || ""
})

const createdUser = await User.findById(user._id).select("-password -refreshToken")

if(!createdUser){
    throw new ApiError(500, "Something went wrong while registering User")
}


return res.status(201).json(
    new ApiResponse(200,createdUser,"User register successfully")
)

})
export {registerUser}