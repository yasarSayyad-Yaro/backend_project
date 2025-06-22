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

// import routes
import userRouter from './routes/user.routes.js'
import videoRouter from './routes/video.routes.js'
import subscriptionRouter from './routes/subscription.routes.js'
import tweetRouter from './routes/tweet.routes.js'
import playlistRouter from './routes/playlist.routes.js'
import commentRouter from './routes/comment.routes.js'
import likeRouter from './routes/like.routes.js'

app.use("/api/v1/users",userRouter)
app.use("/api/v1/videos",videoRouter)
app.use("/api/v1/subscriptions",subscriptionRouter)
app.use("/api/v1/tweets",tweetRouter)
app.use("/api/v1/playlists",playlistRouter)
app.use("/api/v1/comments",commentRouter)
app.use("/api/v1/likes",likeRouter)


export { app }