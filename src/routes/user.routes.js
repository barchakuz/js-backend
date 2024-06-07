import { Router } from "express";
import {registerUser, userLogin, userLogOut, refreshAccessToken,changeUserPassword, getCurrentUser,updateUserAvatar, getUserChannelProfile, getWatchHistory, updateAccountDetails} from "../controllers/user.controller.js"; 
import { upload } from "../middlewares/cloudinary.middleware.js"
import { verifyJwt } from "../middlewares/auth.middleware.js";


const userRouter = Router();

userRouter.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        }, 
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
    )
userRouter.route("/login").post(userLogin);
userRouter.route("/logout").post(verifyJwt, userLogOut);
userRouter.route("/refresh-token").post(refreshAccessToken)
userRouter.route("/change-password").post(verifyJWT, changeUserPassword)
userRouter.route("/current-user").get(verifyJWT, getCurrentUser)
userRouter.route("/update-account").patch(verifyJWT, updateAccountDetails)

userRouter.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)
userRouter.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)

userRouter.route("/c/:username").get(verifyJWT, getUserChannelProfile)
userRouter.route("/history").get(verifyJWT, getWatchHistory)


export {userRouter}