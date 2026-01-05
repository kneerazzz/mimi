import app from "./app.js";
import cron from 'node-cron'
import connectDB from "./db/index.js";
import { PORT } from "./config/env.js";
import { cacheMemeFeed, ensureMemeFeedNotEmpty } from "./controllers/meme.controller.js";

connectDB()
.then(() => {
    app.get("/", (req, res) => {
        res.send("<h1>mimi server is running wohohohho</h1>")
    })

    app.get("/meme", (req, res) => {
        res.send("<h2>yo its actually working</h2>")
    })
    
        
    cron.schedule("0 */2 * * *", async () => {
        console.log("CRON: Refreshing meme cache...");
        try {
            await cacheMemeFeed()
        } catch (error) {
            console.log("Cron error : ", error)
        }
    });

    app.listen(PORT, async () => {
        console.log(`server is running on port ${PORT}`)
        console.log(`http://localhost:${PORT}`);
        await ensureMemeFeedNotEmpty()
    })

})
.catch((error) => {
    console.log("connection database failed!", error)
})
