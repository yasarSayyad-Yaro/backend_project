import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/ayncHandler.js";
import {Video} from "../models/video.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import {v2 as cloudinary} from "cloudinary"

const getAllVideos=asyncHandler(async(req,res)=>{
    // const {page=1,limit=10,query,sortby,sortType,userId}=res.query
    const {page=1,limit=10,query="",sortby="createdAt",sortType="desc",userId}=req.query

    const matching={};

    if(query){
        matching.title={$regex:query,$options:"i"}
    }

    if(userId && mongoose.Types.ObjectId.isValid(userId)){
        matching.owner= new mongoose.Types.ObjectId(userId)
    }

    const videos= await Video.aggregate([
        {
            $match:matching
        },
        {
            $lookup:{
                from:"user",
                localField:"owner",
                foreignField:"_id",
                as:"ownerDetails"
            }
        },
        {
            $project:{
                title:1,
                description:1,
                duration:1,
                views:1,
                thumbnail:1,
                videoFile:1,
                isPublished,
                createdAt:1,
                owner:{
                    _id:"$ownerDetails._id",
                    username:"ownerDetails.username",
                    avatar:"ownerDetails.avatar"
                }
            }
        },
        {
            $sort:{
                [sortby]:sortType==="asc"?1:-1 
            }
        },
        {
            $skip:(parseInt(page) - 1) * parseInt(limit)
        },
        {
            $limit:parseInt(limit)
        }
    ])

    if(!videos?.length){
        throw new ApiError(404,"Videos are not found")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,videos,"Videos feteched successfully"))
})

const publishAVideo=asyncHandler(async(req,res)=>{
    const {title, description} = req.body
    
    if(!title || !description){
        throw new ApiError(400,"Title and description are required")
    }

    const videoFileLocalPath=req.files?.videoFile?.[0].path;
    const thumbnailLocalPath=req.files?.thumbnail?.[0].path;

    if(!videoFileLocalPath){
        throw new ApiError(400,"video file is required")
    }
    if(!thumbnailLocalPath){
        throw new ApiError(400,"thumbnail is required")
    }

    const uploadedVideo=await uploadOnCloudinary(videoFileLocalPath,"video")
    const uploadedThumnail=await uploadOnCloudinary(thumbnailLocalPath)

    if(!uploadedVideo.url){
        throw new ApiError(500,"Video upload fail")
    }
    if(!uploadedThumnail.url){
        throw new ApiError(500,"Thumnail upload failed")
    }

    const newVideo=await Video.create({
        title,
        description,
        videoFile:{
            url:uploadedVideo.url,
            public_id:uploadedVideo.public_id
        },
        thumbnail:{
            url:uploadedThumnail.url,
            public_id:uploadedThumnail.public_id

        },
        owner:req.user?._id,
        duration:uploadedVideo.duration
    })

    if(!newVideo){
        throw new ApiError(500,"Video document not created successfully")
    }

    return res
    .status(200)
    .json(new ApiResponse(201,newVideo,"Video published successfully"))
})

const getVideoById=asyncHandler(async(req,res)=>{
    const {videoId}=req.params
    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400,"Invalid video Id")
    }

    const video=await Video.findById(videoId).populate("owner","username avatar")

    if(!video){
        throw new ApiError(400,"Video not found")
    }

    return res.status(200)
    .json(new ApiResponse(200,video,"Video fetched successfully"))
})

const updateVideo=asyncHandler(async(req,res)=>{
    const {videoId} = req.params
    const {title,description}=req.body
    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400,"Invalid video Id")
    }

    const updatedata={}

    if(title){
        updatedata.title=title
    }
    if(description){
        updatedata.description=description
    }


    const thumbnailLocalPath=req.file?.path
    if(thumbnailLocalPath){
        const thumbnail=await uploadOnCloudinary(thumbnailLocalPath)
        if(!thumbnail.url){
            throw new ApiError(400,"error while uploading thumbnail")
        }
        updatedata.thumbnail=thumbnail.url
    }

    const updateVideo=await Video.findByIdAndUpdate(
        videoId,
        {$set:updatedata},
        {new:true}
    )

    return res
    .status(200)
    .json(new ApiResponse(200,updateVideo,"Video updated successfully"))
    
})

const deleteVideo=asyncHandler(async(req,res)=>{
    const {videoId}=req.params
    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400,"Invalid video id")
    }

    const validatevideo=await Video.findById(videoId)

    if(!validatevideo){
        throw new ApiError(404,"Video not found")
    }

    if(validatevideo.videoFile?.public_id){
        await cloudinary.uploader.destroy(validatevideo.videoFile.public_id,{
            resource_type:"video"
        })
    }

    if(validatevideo.thumbnail?.public_id){
        await cloudinary.uploader.destroy(validatevideo.thumbnail.public_id,{
            resource_type:"video"
        })
    }

    await Video.findByIdAndDelete(videoId)

    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"Video deleted successfully")
    )
    
})

const togglePublishStatus=asyncHandler(async(req,res)=>{
    const {videoId} = req.params
    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400,"invalid video id")
    }

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(400,"video not found")
    }

    video.isPublished=!video.isPublished
    await video.save()
     
    return res
    .status(200)
    .json(new ApiResponse(200,video,"Video status updated successfully"))
    
})


export {
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    getAllVideos
}