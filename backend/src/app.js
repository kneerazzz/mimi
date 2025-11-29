import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import corn from 'node-cron'
import { cacheMemeFeed } from './controllers/meme.controller.js'

const app = express()

app.use(cors({
    origin: 'http://localhost:4000',
    credentials: true
}))


app.use(express.json({
    limit: "16kb"
}))

app.use(express.static('public'))

app.use(express.urlencoded({
    limit: "16kb"
}))

app.use(cookieParser())

cacheMemeFeed()
corn.schedule(" 0 * * * * ", () => {
    console.log("caching memes from reddit werarara")
    cacheMemeFeed()
})

import userRouter from './routes/user.routes.js'
import memeRouter from './routes/Meme.routes.js'

app.use("/api/v1/users", userRouter)
app.use("/api/v1/memes", memeRouter)



export default app;