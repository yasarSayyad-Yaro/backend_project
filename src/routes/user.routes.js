import { Router } from "express";
import { 
    changeCurrentPassword, 
    getCurrectUser, 
    getUserChannelProfile, 
    getWatchHistory, 
    loginUser, 
    logoutUser, 
    registerUser, 
    updateAccountDetails, 
    updateAvaterImage, 
    updateCoverImage 
} from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { refreshAccessToken } from "../controllers/user.controller.js";
const router = Router()

router.route("/register").post(
    upload.fields([
        {name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser)
// http://localhost:8000/users/register

router.route("/login").post(loginUser)

// secured Routes
router.route("/logout").post(verifyJWT,logoutUser)

router.route("/refresh-token").post(refreshAccessToken)

router.route("/change-password").post(verifyJWT,changeCurrentPassword)

router.route("/current-user").get(verifyJWT,getCurrectUser)

router.route("/updateAccount").patch(verifyJWT,updateAccountDetails)

router.route("/avatar").patch(verifyJWT,upload.single("avatar"),updateAvaterImage)

router.route("/cover-image").patch(verifyJWT,upload.single("coverImage"),updateCoverImage)

router.route("/c/:username").get(verifyJWT,getUserChannelProfile)

router.route("history").get(verifyJWT,getWatchHistory)


export default router