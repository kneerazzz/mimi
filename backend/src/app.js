import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

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

export default app;