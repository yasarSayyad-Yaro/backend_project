import { response } from "express"
import {asyncHandler} from "../utils/ayncHandler.js"
import { createConnection } from "mongoose"
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import cookieParser from "cookie-parser"

const generateAccessAndRefreshTokens = async(userId)=>{
try {
    const user=await User.findById(userId)
    const accessToken=user.generateAccessToken()
    const refreshToken=user.generateRefreshToken()

    user.refreshToken=refreshToken
    await user.save({validateBeforeSave:false})

    return {refreshToken,accessToken}

} catch (error) {
    throw new ApiError(500,"something went wrong while generating refresh and access token")
}
}


const registerUser = asyncHandler(async(req,res)=> {
    // steps to register user
    // 1.Get  user details from frontend
    // 2.validation on input data
    // 3.check if user already exits
    // 4.check for images and for avatar
    // 5.upload them to cloudinary, avatar checking
    // 6.create user object->create entry in db
    // 7.remove password and refresh token field from response
    // 8.check for user creation
    // 9.return res
    const {fullname,email,username,password}=req.body
    // if(fullname === ""){
    //     throw new ApiError(400,"fullname is required")
    // }
    if (
        [fullname,email,username,password].some((field)=> field?.trim() === "")
    ) {
        throw new ApiError(400,"All field are required")
    }

    const existedUser = await User.findOne({
        $or:[{username},{email}]
    })

    if(existedUser){
        throw new ApiError(409,"User email or username already exists")
    }

    const avatarLocalPath=req.files?.avatar[0]?.path
    const coverImageLocalPath=req.files?.coverImage[0]?.path

    if(!avatarLocalPath)
    {
        throw new ApiError(400,"Avatar image required")
    }

   const avatar= await uploadOnCloudinary(avatarLocalPath)
   const coverImage=await uploadOnCloudinary(coverImageLocalPath)
   
   if(!avatar){
    throw new ApiError(400,"Avatar image required")
   }
   
   const user=await User.create({
    fullname,
    avatar:avatar.url,
    coverImage:coverImage?.url || "",
    email,
    password,
    username:username.toLowerCase()
   })

   const createdUser=await User.findById(user._id).select(
    "-password -refreshToken"
   )

   if(!createdUser){
    throw new ApiError(500,"something goes wrong while registering user")
   }

   return res.status(201).json(
    new ApiResponse(200,createdUser,"User registered successfully")
   )



})

const loginUser=asyncHandler(async(req,res)=>{
// get user data from req body
// check username or email
// find the user
// check password
// generate access and refresh token
// send cookies
const {email,username,password}=req.body
// if(!(username || email))
if(!username && !email){
    throw new ApiError(400,"username or password is required")
}
const user=await User.findOne({
    $or: [{username},{email}]
})

if(!user){
    throw new ApiError(404,"username or email does not exit")
}
const isPasswordValid=await user.isPasswordCorrect(password)

if(!isPasswordValid){
    throw new ApiError(401,"incorrect password")
}

const {accessToken,refreshToken}=await generateAccessAndRefreshTokens(user._id)

const loggedInUser=await User.findById(user._id).select("-password -refreshToken")

const options={
    httpOnly:true,
    secure:true
}

return res
.status(200)
.cookie("accessToken",accessToken,options)
.cookie("refreshToken",refreshToken,options)
.json(
    new ApiResponse(
        200,
    {
        user:loggedInUser,accessToken,refreshToken
    },
    "User logged in Successfully"
    )
)
})

const logoutUser=asyncHandler(async(req,res)=>{
await User.findByIdAndUpdate(
    req.user._id,
    {
        $set:{
            refreshToken:undefined
        }
    },
    {
        new:true
    }
)
const options={
    httpOnly:true,
    secure:true
}
return res
.status(200)
.clearCookie("accessToken",options)
.clearCookie("refreshToken",options)
.json(new ApiResponse(200,{},"User Logout"))

})


export {
    registerUser,
    loginUser,
    logoutUser,
}