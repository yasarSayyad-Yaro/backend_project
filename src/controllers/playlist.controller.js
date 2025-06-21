import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { asyncHandler } from "../utils/ayncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Playlist } from "../models/playlists.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { isValidObjectId } from "mongoose";
import { title } from "process";

const createPlaylist=asyncHandler(async(req,res)=>{
    const {playlistname,playlistdescription}=req.body
    if(!playlistname||playlistname.trim().length===0){
        throw new ApiError(400,"Name of Playlist cannot be empty")
    }
    if(!playlistdescription||playlistdescription.trim().length===0){
        throw new ApiError(400,"Description of Playlist cannot be empty")
    }

    const playlist=await Playlist.create(
        {
            name:playlistname.trim(),
            description:playlistdescription.trim(),
            owner:req.user._id
        }
    )

    if(!playlist){
        throw new ApiError(400,"Error while creating playlist")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,playlist,"Playlist created successfully"))

})

const getUserPlaylist=asyncHandler(async(req,res)=>{
    const {userid}=req.params
    if(!isValidObjectId(userid)){
        throw new ApiError(400,"Invalid user id")
    }

    const userplaylist=await Playlist.aggregate([
        {
            $match:{
                owner:new mongoose.Types.ObjectId(userid)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"playlistOwner"
            }
        },
        {
            $unwind:"$playlistOwner"
        },
        {
            $project:{
                _id:1,
                name:1,
                description:1,
                videos:1,
                owner:{
                    _id:"$playlistOwner._id",
                    username:"$playlistOwner.username",
                    avatar:"$playlistOwner.avatar"
                },
                createdAt:1
            }
        }
])

if(!userplaylist.length){
    return res.status(200).json(new ApiResponse(200,[],"No playlist found"))
}

return res
.status(200)
.json(new ApiResponse(200,userplaylist[0],"Playlist fetched successfully"))

})

const getPlaylistById=asyncHandler(async(req,res)=>{
    const {playlistId}=req.params
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid playlist Id")
    }
    const findplaylist=await Playlist.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(playlistId)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"ownerdetails"
            }
        },
        {
            $unwind:"$ownerdetails"
        },
        {
            $lookup:{
                from:"videos",
                localField:"videos",
                foreignField:"_id",
                as:"videodetails"
            }
        },
        {
            $project:{
                _id:1,
                name:1,
                description:1,
                createdAt:1,
                owner:{
                    _id:"$ownerdetails._id",
                    username:"$ownerdetails.username",
                    avatar:"$ownerdetails.avatar"
                },
                videos:{
                    $map:{
                        input:"$videodetails",
                        as:"vid",
                        in:{
                            _id:"$$vid._id",
                            title:"$$vid.title",
                            thumbnail:"$$vid.thumbnail",
                            duration:"$$vid.duration"
                        }
                    }

                }

            }
        }

    ])

    if(!findplaylist || findplaylist.length===0){
        return res.status(200).json(new ApiResponse(200,[],"Playlist not found"))
    }

    return res
    .status(200)
    .json(new ApiResponse(200,findplaylist[0],"Playlist fetch successfully"))
})

const addVideoToPlaylist=asyncHandler(async(req,res)=>{
    const {playlistId,videoid}=req.params
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid playlist id")
    }
    if(!isValidObjectId(videoid)){
        throw new ApiError(400,"Invalid video Id")
    }
    
    const playlist=await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(404,"Playlist not found")
    }
    const videoexists=await Video.findById(videoid)
    if(!videoexists){
        throw new ApiError(404,"Video not found with such Id")
    }

    const updatedPlaylist=await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $addToSet:{
                videos:videoid
            }
        },
        {
            new:true
        }
    ).populate("videos","title thumbnail duration")
     .populate("owner","username avatar")

    return res
    .status(200)
    .json(new ApiResponse(200,updatedPlaylist,"Video added to playlist"))

})

const removeVideoFromPlaylist=asyncHandler(async(req,res)=>{
    const {playlistId,videoid}=req.params
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid playlistId")
    }
     if(!isValidObjectId(videoid)){
        throw new ApiError(400,"Invalid videoId")
    }

    const playlist=await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(404,"No playlist found")
    }

    const isVideoInPlaylist=await playlist.videos.some(
        (vid)=>vid.toString()===videoid
    )

    if(!isVideoInPlaylist){
        throw new ApiError(404,"Video not found in the playlist")
    }
    
    const updatedPlaylist=await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull:{
                videos:videoid
            }
        },
        {
            new:true
        }
    ).populate("videos","title thumbnail duration")
     .populate("owner","username avatar")

    return res
    .status(200)
    .json(new ApiResponse(200,updatedPlaylist,"Video removed from playlist"))

})

const deletePlaylist=asyncHandler(async(req,res)=>{
    const {playlistId}=req.params

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid playlist id")
    }

    const playlist=await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(404,"Playlist not found")
    }

    await Playlist.findByIdAndDelete(playlistId)

    return res
    .status(200)
    .json(new ApiResponse(200,{},"playlist deleted successfully"))
    
})

const updatePlaylistDetails=asyncHandler(async(req,res)=>{
    const {playlistId}=req.params
    const {playlistname,playlistdescription}=req.body
    const updatedata={}

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid playlistId")
    }

    if(!playlistname ||playlistname.trim().length===0){
        throw new ApiError(400,"playlist name cannot be empty")
    }
    if(!playlistdescription||playlistdescription.trim().length===0){
        throw new ApiError(400,"playlist description cannot be empty")
    }
      updatedata.name=playlistname.trim()
      updatedata.description=playlistdescription.trim()
      
    const playlist=await Playlist.findOne(
        {
            _id:playlistId,
            owner:req.user._id
        }
    )

    if(!playlist){
        throw new ApiError(400,"playlist with userid or playlist doest found")
    }

    const updateplaylist=await Playlist.findByIdAndUpdate(
        playlistId,
        {$set:updatedata},
        {new:true}
    )
    return res
    .status(200)
    .json(new ApiResponse(200,updateplaylist,"playlist updated successfully"))
})

export {
    createPlaylist,
    getUserPlaylist,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylistDetails
}