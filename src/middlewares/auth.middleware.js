import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/ayncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
export const verifyJWT=asyncHandler(async(req,res,next)=>{
   try {
     const token=req.cookies?.accessToken || req.header("Authorization")?.replce("Bearer ","")
 
     if(!token){
         throw new ApiError(401,"Unauthorized access")
     }
 
     const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
 
     const user=await User.findById(decodedToken?._id).select("-password -refreshToken")
 
     if(!user){
         throw new ApiError(401,"Invalid Access Token")  
     }
 
     req.user=user;
     next()
   } catch (error) {
    throw new ApiError(401,error?.message||"Invalid access Token")
   }
})