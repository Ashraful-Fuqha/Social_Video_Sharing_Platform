import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
// import csurf from 'csurf'

const app = express()

app.use(cors(
    {
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    }
))

// app.use(csurf({cookie:true}))
app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit : "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

// router imports

import userRouter from "./routes/user.routes.js"
import commentRouter from "./routes/comment.route.js"
import videoRouter from "./routes/video.route.js"
import healthcheckRouter from "./routes/healthCheck.route.js"
import tweetRouter from "./routes/tweet.route.js"
import subscriptionRouter from "./routes/subscription.route.js"
import likeRouter from "./routes/like.route.js"
import playlistRouter from "./routes/playlist.route.js"
import dashboardRouter from "./routes/dashboard.route.js"

//router declaration

app.use("/api/v1/healthcheck", healthcheckRouter)
app.use("/api/v1/users", userRouter)
app.use("/api/v1/tweets", tweetRouter)
app.use("/api/v1/subscriptions", subscriptionRouter)
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/comments", commentRouter)
app.use("/api/v1/likes", likeRouter)
app.use("/api/v1/playlist", playlistRouter)
app.use("/api/v1/dashboard", dashboardRouter)

//http:// localhost:8000/api/v1/users/register

export { app }