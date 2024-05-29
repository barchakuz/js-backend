import { Router } from "express";
import {registerUser, userLogin, userLogOut} from "../controllers/user.controller.js"; 
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

export {userRouter}