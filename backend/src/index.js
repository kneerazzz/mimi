import app from "./app.js";
import connectDB from "./db/index.js";
import { PORT } from "./config/env.js";

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
