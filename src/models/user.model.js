import mongoose  from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
const userSchmea=new mongoose.Schema(
    {
        username:{
            type:String,
            required:true,
            lowercase:true,
            unique:true,
            trim:true,
            index:true
        },
        email:{
            type:String,
            required:true,
            lowercase:true,
            unique:true,
            trim:true
        },
        fullname:{
            type:String,
            required:true,
            trim:true,
            index:true
        },
        avatar:{
            type:String,
            required:true
        },
        coverImage:{
            type:String,
        },
        watchHistory:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:"Video"
    
            }
        ],
        password:{
            type:String,
            required:[true,"password is required"]

        },
        refreshToken:{
            type:String,
        }

        
    },
{timestamps:true})

userSchmea.pre("save",async function(next){
    if(!this.isModified("password")) return next();
    
    this.password=await bcrypt.hash(this.password,10)
    next()

})

userSchmea.methods.isPasswordCorrect=async function(password){
    return await bcrypt.compare(password,this.password)
}

userSchmea.methods.generateAccessToken=function(){
   return jwt.sign(
        {
            _id:this._id,
            fullname:this.fullname,
            username:this.username,
            email:this.email
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY

        }
    )

}
userSchmea.methods.generateRefreshToken=function(){
  return  jwt.sign(
        {
            _id:this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY

        }
    )
}

export const User = mongoose.model("User",userSchmea)