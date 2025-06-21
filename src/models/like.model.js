import mongoose from "mongoose";

const likeSchema=new mongoose.Schema(
    {
        comment:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Comment",
            default:null
        },
        video:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Video",
            default:null
        },
        likedBy:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true,
            default:null
        },
        tweet:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Tweet",
            default:null
        }

    },
    {timestamps:true})

export const Like=mongoose.model("Like",likeSchema)