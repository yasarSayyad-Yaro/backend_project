import { Router } from "express";

import {createPlaylist,
    getUserPlaylist,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylistDetails} from "../controllers/playlist.controller.js"

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router=Router()

router.use(verifyJWT)

router.route("/").post(createPlaylist)

router.route("/:playlistId")
.get(getPlaylistById)
.patch(updatePlaylistDetails)
.delete(deletePlaylist)


router.route("/add/:videoId/:playlistId")
.patch(addVideoToPlaylist)
.patch(removeVideoFromPlaylist)

router.route("/user/:userId").get(getUserPlaylist)


export default router
