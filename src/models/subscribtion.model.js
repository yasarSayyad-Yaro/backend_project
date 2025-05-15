import mongoose from "mongoose";
import { User } from "./user.model";
const subscriptionSchema=new mongoose.Schema({
    subscriber:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    channel:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true})

export const Subscribtion = mongoose.model("Subscription",subscriptionSchema)