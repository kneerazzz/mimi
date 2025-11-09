import app from "./app.js";
import dotenv from 'dotenv'

dotenv.config({
    path: './.env'
})
const PORT = process.env.PORT;

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