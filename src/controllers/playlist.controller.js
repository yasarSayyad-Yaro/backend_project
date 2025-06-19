import mongoose from "mongoose";
import { asyncHandler } from "../utils/ayncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Playlist } from "../models/playlists.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { isValidObjectId } from "mongoose";

const createPlaylist=asyncHandler(async(req,res)=>{
    const {playlistname,playlistdescription}=req.body
    if(!playlistname||playlistname.trim().length()===0){
        throw new ApiError(400,"Name of Playlist cannot be empty")
    }
    if(!playlistdescription||playlistdescription.trim().length()===0){
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
.json(new ApiResponse(200,userplaylist,"Playlist fetched successfully"))

})


export {
    createPlaylist
}