import mongoose from "mongoose";
import { asyncHandler } from "../utils/ayncHandler.js";
import { isValidObjectId } from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { Like } from "../models/like.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";
import { Tweet } from "../models/tweet.model.js";

const toggleVideoLike=asyncHandler(async(req,res)=>{
    const {videoId}=req.params
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid video Id")
    }

    const existsVideo=await Video.findById(videoId)
    if(!existsVideo){
        throw new ApiError(404,"Video doesn't Exits")
    }

    const exitslike=await Like.findOne(
        {
            likedBy:req.user._id,
            video:videoId
        }
    )

    if(exitslike){
        await Like.findByIdAndDelete(exitslike._id)
        return res
        .status(200)
        .json(new ApiResponse(200,{},"Video Unlike successfully"))
    }

    await Like.create(
        {
            likedBy:req.user._id,
            video:videoId
        }
    )

    return res
    .status(200)
    .json(new ApiResponse(200,{},"Video like successfully"))
})

const toggleCommentLike=asyncHandler(async(req,res)=>{
    const {commentId}=req.params
    if(!isValidObjectId(commentId)){
        throw new ApiError(400,"Invalid comment Id")
    }

    const exitscomment=await Comment.findById(commentId)
    if(!exitscomment){
        throw new ApiError(404,"Comment does't exists")
    }

    const Likecomment=await Like.findOne({
        likedBy:req.user._id,
        comment:commentId
    })

    if(Likecomment){
        await Like.findByIdAndDelete(Likecomment._id)
        return res
        .status(200)
        .json(new ApiResponse(200,{},"Comment Unlike successfully"))
    }

    await Like.create(
        {
            likedBy:req.user._id,
            comment:commentId
        }
    )
    return res
    .status(200)
    .json(new ApiResponse(200,{},"Comment like successfully"))
})


const toggleTweetLike=asyncHandler(async(req,res)=>{
    const {tweetId}=req.params
    if(!isValidObjectId(tweetId)){
        throw new ApiError(400,"invalid tweetId")
    }

    const exitstweet=await Tweet.findById(tweetId)
    if(!exitstweet){
        throw new ApiError(404,"Tweet does't exits")
    }

    const tweetLike=await Like.findOne({
        likedBy:req.user._id,
        tweet:tweetId
    })

    if(tweetLike){
        await Like.findByIdAndDelete(tweetLike._id)
        return res
        .status(200)
        .json(new ApiResponse(200,{},"Tweet unliked successfully"))
    }

    await Like.create({
        likedBy:req.user._id,
        tweet:tweetId
    })

    return res
    .status(200)
    .json(new ApiResponse(200,{},"Tweet Liked successfully"))
})

const getLikedVideo=asyncHandler(async(req,res)=>{
    const userid=req.user._id

    const likevideos=await Like.find({
        likedBy:userid,
        video:{
            $exists:true
        }
    })
    .populate("video","title thumbnail duration")

    const videos=likevideos.map((like)=>like.video)
    
    return res
    .status(200)
    .json(new ApiResponse(200,videos,"Liked videos fetched successfully"))
})

export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideo
}