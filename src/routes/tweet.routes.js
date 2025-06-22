import { Router } from "express";
import{createTweet,
    getUserTweets,
    updateTweet,
    deletetweet} from "../controllers/tweet.controller.js"

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router=Router()

router.use(verifyJWT)

router.route("/")
.post(createTweet)

router.route("/user/:userId")
.get(getUserTweets)

router.route("/:tweetId")
.patch(updateTweet)
.delete(deletetweet)


export default router