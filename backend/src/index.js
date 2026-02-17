import app from "./app.js";
import cron from 'node-cron'
import connectDB from "./db/index.js";
import { PORT } from "./config/env.js";
import { cacheMemeFeed, ensureMemeFeedNotEmpty } from "./controllers/meme.controller.js";

connectDB()
.then(() => {

    app.get("/", (req, res) => {
        res.send("<h1>mimi server is running wohohohho</h1> <h2>visit <a href='https://mimi-create.vercel.app'>MIMI</a> To Check the running site</h2>")
    });

    app.listen(PORT, () => {
        console.log(`server is running on port https://mimi-backend.onrender.com`);
        console.log(`https://mimi-backend.onrender.com`);

        // Run heavy stuff AFTER server starts
        cacheMemeFeed().catch(console.error);
        ensureMemeFeedNotEmpty().catch(console.error);
    });

    // Cron job
    cron.schedule("0 */2 * * *", async () => {
        console.log("CRON: Refreshing meme cache...");
        try {
            await cacheMemeFeed();
            await ensureMemeFeedNotEmpty();
        } catch (error) {
            console.log("Cron error : ", error);
        }
    });

})
.catch((error) => {
    console.log("connection database failed!", error);
});
