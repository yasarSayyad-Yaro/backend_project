// conncting to db error might occur alway wrap them in try catch remember asyn await
// require('dotenv').config({path:'./env'})

import dotenv from "dotenv"
import mongoose, { Mongoose } from "mongoose";
import { DB_NAME } from "./constants.js";
import connectDB from "./db/indexdb.js";


dotenv.config({
    path:'./env'
})

connectDB()
.then(()=>{
    app.listen(process.env.PORT||8000,()=>{
        console.log(`Server is running at ${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.log("MongoDb connection failed !!",err)
})












/*import express from "express"
const app=express()


;(async () => {
    try{
       await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
       app.on("error",(error)=>{
        console.log("ERROR",error)
        throw error
       })

    }catch(error){
        console.log("ERROR",error)
        throw error
    }
})()
    */