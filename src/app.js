import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
const app = express()

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({limit:"16kb"}))//when excepting form u need limit the data which help to help to prevent server crash
app.use(express.urlencoded())
app.use(express.static("public"))
app.use(cookieParser())

export { app }