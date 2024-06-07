import {ayncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiHandler.js";
import {User} from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudnary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

const generateRefreshTokemAndAccessToken = async(userid)=>{
    try {
        const user = await User.findById(userid)
        const refreshToken = user.generateRefreshTokem()
        const accessToken = user.generateAccessTokem()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave : false})

        return {refreshToken, accessToken}

        
    } catch (error) {
        throw new ApiError(500, "Failed to Generate Token")
    }

}

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
console.log(coverImage); 


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

const userLogin = ayncHandler(async (req, res)=>{
    const {passowrd, email, username} = req.body;
    if(!username || !email){
        throw new ApiError(300, "Email and email required")
    }
    const user = await User.findById({
        $or : [{username},{email}]
    })
    if(!user){
        throw new ApiError(401, "User Not Found")
    }
    const isPasswordValid = await user.isPasswordCorrect(passowrd);
    if(!isPasswordValid){
        throw new ApiError(401, "Incorrect Password")
    }

    const {refreshToken, accessToken} = generateRefreshTokemAndAccessToken(user._id)

    const loginInUser = await User.findById(user._id).select("-password -refreshToken")


    const option = {
        httpOnly : true, secure : true
    }
        return res.status(200)
        .cookie("accessToken", accessToken, option)
        .cookie("refreshToken", refreshToken, options)
        .json(ApiResponse(
            200, {user: loginInUser, accessToken, refreshToken}, "Login Success"
            ))
    


})
const userLogOut = ayncHandler(async(req, res)=>{
    await User.findOneAndUpdate(
        req.user._id,{
            $set : {
                refreshToken : undefined
            }

            
        }
    )
    const option ={
        httpOnly : true, secure : true
    }
    return res.clearcookies("accessToken", option).clearcookies("refreshToken", option).json(200, {},"user Logout Success")
})
const changeUserPassword = ayncHandler(async(req, res)=>{
    const {oldPassword, newPassword} = req.body

    const user = await User.findById(req.user?._id);
    if (!user) {
        throw new Error(400, "User not found in Database")
    }

    user.passowrd = newPassword;
    await user.save({validateBeforeSave : false})
    return res.status(200).json(new ApiResponse(200,{},"Password Successfully Changed"))
})
const getUser = ayncHandler(async(req, res)=>{
    return res.json(200, req.user?._id,"User Found")
})
const changeUserAndEmail = ayncHandler(async(req,res)=>{
    const {fullname, email} = req.body

    User.findByIdAndUpdate(req.user?._id,{ fullname, email : email},{new : true}).select("-password");
})
const changeUserAvatar = ayncHandler(async(req, res)=>{
    const avatarLocalPath = req.file?.path;
    if (!avatarLocalPath) {
        throw new ApiError (400, "Please Upload Avatar")
    }
    const user = await User.findByIdAndUpdate(req.user?._id,{avatar : avatar.url}, {new: true}).select("-password")
    if(!avatar){ throw new ApiError(400, "Avatar Update Failed")}

    return res.status(200).json(new ApiResponse(200,user, "Avatar Change Successfully"))
})
const changeUsercoverImage = ayncHandler(async(req, res)=>{
    const coverImageLocalPath = req.file?.path;
    if (!coverImageLocalPath) {
        throw new ApiError (400, "Please Upload coverImage")
    }
    const user = await User.findByIdAndUpdate(req.user?._id,{coverImage : coverImage.url}, {new: true}).select("-password")
    if(!avatar){ throw new ApiError(400, "coverImage Update Failed")}

    return res.status(200).json(new ApiResponse(200,user, "coverImage Change Successfully"))
})
const getUserChannel = ayncHandler(async (req, res)=>{
    const {username} = req.params

    if (!username?.trim()) {
        throw new ApiError(400, "username is missing")
    }

    await User.aggregate([
        {
            $match :{
                username : username.toLowerCase()
            }
        },
        {
            $lookup:{
                from :"subscriptions",
                localField:"_id",
                foreignField: "channel",
                as : "subscribers",
            }
        },
        {
            $lookup:{
                from :"subscriptions",
                localField:"_id",
                foreignField: "subscriber",
                as : "subscribedTo",
            }
        },
        {
            $addFields:{
                subscribersCount : {
                    $size : "$subscribers"
                },
                subscribedToCount : {
                    $size : "$subscribedTo"
                },
                isSubscribed :{
                    $cond: {
                        if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project : {
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1
            }
        }
    ])
    if (!channel?.length) {
        throw new ApiError(404, "channel does not exists")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, channel[0], "User channel fetched successfully")
    )
})
const getWatchHistory = asyncHandler(async(req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user[0].watchHistory,
            "Watch history fetched successfully"
        )
    )
})

export {
    registerUser,
     userLogin,
     userLogOut,
     changeUserPassword,
     getUser,
     changeUserAvatar,
     changeUsercoverImage,
     changeUserAndEmail,
     getUserChannel,
     getWatchHistory

}