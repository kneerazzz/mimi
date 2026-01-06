import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import handelNewVisitor from './middlewares/handleNewVisitor.middleware.js'
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



import userRouter from './routes/user.routes.js'
import memeRouter from './routes/Meme.routes.js'
import likeRouter from './routes/likedMeme.route.js'
import commentRouter from './routes/comment.routes.js'
import saveRouter from './routes/savedMeme.routes.js'
import templateRouter from './routes/template.routes.js'
import savedTemplateRouter from './routes/savedTemplates.routes.js'
import createRouter from './routes/createMeme.routes.js'
import { verifyJwt } from './middlewares/auth.middleware.js'
import handleNewVisitor from './middlewares/handleNewVisitor.middleware.js'


app.use("/", verifyJwt)
app.use("/", handleNewVisitor)

app.use("/api/v1/users", userRouter)
app.use("/api/v1/memes", memeRouter)
app.use("/api/v1/like", likeRouter);
app.use("/api/v1/comment", commentRouter);
app.use("/api/v1/save", saveRouter);
app.use("/api/v1/template", templateRouter)
app.use("/api/v1/savedTemplate", savedTemplateRouter)
app.use("/api/v1/create", createRouter)


export default app;