import { Comment } from "../models/comment.model.js";
import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/ayncHandler.js";
import { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";




const addComment=asyncHandler(async(req,res)=>{
    const {videoId}=req.params
    const {commentContent}=req.body
    
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"invalid video id")
    }

    if(!commentContent || commentContent.trim().length===0){
        throw new ApiError(400,"comment cannot be empty")
    }

    const findVideo=await Video.findById(videoId)
    if(!findVideo){
        throw new ApiError(404,"Video not found")
    }

    const newComment=await Comment.create({
        content:commentContent.trim(),
        video:videoId,
        owner:req.user._id
    })

    return res
    .status(200)
    .json(new ApiResponse(200,newComment,"Comment added successfully"))
})

const updateComment=asyncHandler(async(req,res)=>{
    const {commentId}=req.params
    const {updatedComment}=req.body

    if(!isValidObjectId(commentId)){
        throw new ApiError(400,"Invalid comment Id")
    }

    if(!updatedComment || updatedComment.trim().length===0){
        throw new ApiError(400,"comment cant be empty")
    }

    const exitcomment=await Comment.findOne({
        _id:commentId,
        owner:req.user._id
    })

    if(!exitcomment){
        throw new ApiError(400,"Comment not found or not athorized ")
    }
    
    exitcomment.content=updatedComment.trim()
    await exitcomment.save()
  
    return res
    .status(200)
    .json(new ApiResponse(200,exitcomment,"comment updated successfully"))

})

const deleteComment=asyncHandler(async(req,res)=>{
    const {commentId}=req.params

    if(!isValidObjectId(commentId)){
        throw new ApiError(400,"invalid comment id")
    }

    const existingComment=await Comment.findOne({
        _id:commentId,
        owner:req.user._id
    })

    if(!existingComment){
        throw new ApiError(400,"Comment not found or not authorized ")
    }

    await Comment.findByIdAndDelete(commentId)

    return res
    .status(200)
    .json(new ApiResponse(200,{},"comment deleted successfully"))

})

const getVideoComments=asyncHandler(async(req,res)=>{
    const {videoId}=req.params
    const {page=1,limit=10}=req.query

    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid videoId")
    }
    const findComment=await Comment.aggregate([
        {
            $match:{video:new mongoose.Types.ObjectId(videoId)}
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"ownerInfo"

            }
        },
        {
            $unwind:"$ownerInfo"
        },
        {
            $project:{
                _id:1,
                content:1,
                createdAt:1,
                owner:{
                    _id:"$ownerInfo._id",
                    username:"$ownerInfo.username",
                    avatar:"$ownerInfo.avatar",
                    fullname:"$ownerInfo.fullname"
                }
            }
        },
        {
            $sort:{createdAt:-1}
        },
        {
            $skip:(parseInt(page)-1) * parseInt(limit)
        },
        {
            $limit:parseInt(limit)
        }
    ])

    return res
    .status(200)
    .json(new ApiResponse(200,findComment,"Comments fetched successfully"))
})


export {
    addComment,
    updateComment,
    deleteComment,
    getVideoComments
}