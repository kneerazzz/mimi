import app from "./app.js";
import dotenv from 'dotenv'
import connectDB from "./db/index.js";

dotenv.config({
    path: './.env'
})
const PORT = process.env.PORT;

connectDB()
.then(() => {
    app.get("/", (req, res) => {
        res.send("<h1>mimi server is running wohohohho</h1>")
    })

    app.get("/meme", (req, res) => {
        res.send("<h2>yo its actually working</h2>")
    })

    app.listen(PORT, () => {
        console.log(`server is running on port ${PORT}`)
        console.log(`http://localhost:${PORT}`);
    })
})
.catch((error) => {
    console.log("connection database failed!", error)
})
