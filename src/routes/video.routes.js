import { Router } from "express";

import { publishAVideo,getVideoById,updateVideo,deleteVideo,togglePublishStatus,getAllVideos} from "../controllers/video.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router=Router()

router.use(verifyJWT)

// 📍 POST /api/videos → Publish a video
// 📍 GET  /api/videos → Get all videos

router
.route("/")
.get(getAllVideos)
.post(
    upload.fields([
        {
        name:"videoFile",
        maxCount:1
    },
    {
        name:"thumbnail",
        maxCount:1
    }
    ]),
    publishAVideo
)

// 📍 GET     /api/videos/:videoId   → Get video by ID
// 📍 DELETE  /api/videos/:videoId   → Delete video
// 📍 PATCH   /api/videos/:videoId   → Update video (with optional thumbnail)

router
.route("/:videoId")
.get(getVideoById)
.delete(deleteVideo)
.patch(upload.single("thumbnail"),updateVideo)

// 📍 PATCH /api/videos/toggle/publish/:videoId → Toggle publish status
router.route("/toggle/publish/:videoId").patch(togglePublishStatus)


export default router