import mongoose from "mongoose";
import { asyncHandler } from "../utils/ayncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Tweet } from "../models/tweet.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { isValidObjectId } from "mongoose";

const createTweet=asyncHandler(async(req,res)=>{
    const {tweetcontent}=req.body
    if(!tweetcontent||tweetcontent.trim().length===0){
        throw new ApiError(400,"tweet cannot be empty")
    }
    const tweet=await Tweet.create({
        content:tweetcontent.trim(),
        owner:req.user._id
    })

    if(!tweet){
        throw new ApiError(400,"Error while creating tweet")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,tweet,"Tweet created successfully"))
})

const getUserTweets=asyncHandler(async(req,res)=>{
    const {userId}=req.params
    if(!isValidObjectId(userId)){
        throw new ApiError(400,"Invalid user Id")
    }

    const getTweet=await Tweet.find({
        owner:new mongoose.Types.ObjectId(userId)
    })

    if(!getTweet){
        throw new ApiError(404,"No tweet of user found")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,getTweet,"Tweets fetched successfully"))
})

const updateTweet=asyncHandler(async(req,res)=>{
    const {tweetid}=req.params
    const {updatecontent}=req.body

    if(!isValidObjectId(tweetid)){
        throw new ApiError(400,"invalid tweetid")
    }

    if(!updatecontent||updatecontent.trim().length===0){
        throw new ApiError(400,"tweet cannot be empty")
    }

    const findtweet=await Tweet.findOne({
        _id:tweetid,
        owner:req.user._id
    })

    if(!findtweet){
        throw new ApiError(404,"No tweet found with this user")
    }

    findtweet.content=updatecontent.trim()
    await findtweet.save()

    return res
    .status(200)
    .json(new ApiResponse(200,findtweet,"tweet updated successfully"))

})

const deletetweet=asyncHandler(async(req,res)=>{
    const {tweetId}=req.params
    if(!isValidObjectId(tweetId)){
        throw new ApiError(400,"Invalid tweet Id")
    }
    const exitstsweet=await Tweet.findOne({
        _id:tweetId,
        owner:req.user._id
    })

    if(!exitstsweet){
        throw new ApiError(404,"No tweet found")
    }
   
    await Tweet.findByIdAndDelete(tweetId)

    return res
    .status(200)
    .json(new ApiResponse(200,{},"tweet deleted successfully"))

})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deletetweet
}