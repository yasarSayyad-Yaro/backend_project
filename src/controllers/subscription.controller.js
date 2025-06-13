import mongoose  from "mongoose";
import {User} from "../models/user.model.js"
import {Video} from "../models/video.model.js"
import { asyncHandler } from "../utils/ayncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Subscribtion } from "../models/subscribtion.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Subscription } from "../models/subscribtion.model.js";

const toggleSubscription=asyncHandler(async(req,res)=>{
    const {channelId}=req.params
    const {subscriberUserid}=req.user._id

    if(!mongoose.Types.ObjectId.isValid(channelId)){
        throw new ApiError(400,"invalid channel ID")
    }

    if(subscriberUserid.toString()===channelId.toString()){
        throw new ApiError(400,"You cant subscribe to your own  channel")
    }

    const checksubscription=await Subscribtion.findOne({
        subscriber:subscriberUserid,
        channel:channelId
    })

    if(checksubscription){
        await Subscription.findByIdAndDelete(checksubscription._id)
        return res.status(200)
        .json(new ApiResponse(200,{},"UnSubscribed successfully"))
    }

    await Subscription.create({
        subscriber:subscriberUserid,
        channel:channelId
    })

    return res
    .status(200)
    .json(new ApiResponse(200,{},"Subscribed successfully"))

})

const getUserChannelSubscribers=asyncHandler(async(req,res)=>{
    const {channelId}=req.params
    if(!mongoose.Types.ObjectId.isValid(channelId)){
        throw new ApiError(400,"invalid channel id")
    }

    const subscribers=await Subscription.aggregate([
        {
            $match:{
                channel:new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"subscriber",
                foreignField:"_id",
                as:"subscriberInfo"
            }
        },
        {
            $unwind:"$subscriberInfo"
        },
        {
            $project:{
                _id:0,
                subscriberId:"$subscriberInfo._id",
                username:"subscriberInfo.username",
                fullname:"subscriberInfo.fullname",
                avatar:"subscriberInfo.avatar"
            }
        }

    ])

    return res.status(200)
    .json(new ApiResponse(200,subscribers,"Subscribers fetched successfully"))

})



export {
    toggleSubscription,
    getUserChannelSubscribers
}