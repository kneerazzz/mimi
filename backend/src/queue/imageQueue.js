import Bull from 'bull';
import { uploadFromUrl } from '../utils/fileUpload.js';
import { MemeFeedPost } from '../models/memeFeedPost.model.js';

/**
 * Create upload queue
 * Install: npm install bull
 * Requires: Redis server running
 */
export const imageUploadQueue = new Bull('meme-image-upload', {
    redis: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD || undefined
    },
    defaultJobOptions: {
        attempts: 3, // Retry up to 3 times
        backoff: {
            type: 'exponential',
            delay: 2000 // Start with 2s, then 4s, then 8s
        },
        removeOnComplete: 100, // Keep last 100 completed jobs for monitoring
        removeOnFail: 500 // Keep last 500 failed jobs for debugging
    }
});

/**
 * Process upload jobs
 * Runs 5 uploads concurrently
 */
imageUploadQueue.process(5, async (job) => {
    const { redditPostId, redditImageUrl, title } = job.data;
    
    console.log(`[Queue] Processing upload for ${redditPostId}: "${title}"`);
    
    try {
        // Upload to Cloudinary
        const result = await uploadFromUrl(redditImageUrl, {
            folder: 'reddit-memes',
            public_id: `reddit-${redditPostId}`
        });

        
        if (!result) {
            throw new Error('Upload returned null');
        }
        
        // Update database with Cloudinary URL
        await MemeFeedPost.updateOne(
            { redditPostId },
            { 
                $set: {
                    contentUrl: result.url,
                    uploadedToCloudinary: true,
                }
            }
        );
        
        console.log(`[Queue] ✓ Uploaded ${redditPostId} to Cloudinary`);
        console.log(result.secure_url);
        console.log("url");
        console.log(result.url);
        return {
            success: true,
            redditPostId,
            cloudinaryUrl: result.secure_url
        };
        
    } catch (error) {
        console.error(`[Queue] ✗ Failed to upload ${redditPostId}: ${error.message}`);
        throw error; // Will trigger retry
    }
});

/**
 * Event listeners for monitoring
 */
imageUploadQueue.on('completed', (job, result) => {
    console.log(`[Queue] Job ${job.id} completed: ${result.redditPostId}`);
});

imageUploadQueue.on('failed', (job, err) => {
    console.error(`[Queue] Job ${job.id} failed after ${job.attemptsMade} attempts: ${err.message}`);
});

imageUploadQueue.on('stalled', (job) => {
    console.warn(`[Queue] Job ${job.id} stalled`);
});

/**
 * Helper function to add multiple memes to upload queue
 * @param {Array} memes - Array of meme objects with redditPostId and redditImageUrl
 * @returns {Promise<void>}
 */
export const queueMemesForUpload = async (memes) => {
    console.log(`[Queue] Adding ${memes.length} memes to upload queue...`);
    
    const jobs = memes.map(meme => ({
        redditPostId: meme.redditPostId,
        redditImageUrl: meme.redditImageUrl || meme.contentUrl,
        title: meme.title
    }));
    
    // Add all jobs to queue
    await imageUploadQueue.addBulk(
        jobs.map(job => ({
            data: job,
        }))
    );
    
    console.log(`[Queue] ✓ ${memes.length} memes queued for upload`);
};

/**
 * Get queue statistics
 * @returns {Promise<Object>} Queue stats
 */
export const getQueueStats = async () => {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
        imageUploadQueue.getWaitingCount(),
        imageUploadQueue.getActiveCount(),
        imageUploadQueue.getCompletedCount(),
        imageUploadQueue.getFailedCount(),
        imageUploadQueue.getDelayedCount()
    ]);
    
    return {
        waiting,
        active,
        completed,
        failed,
        delayed,
        total: waiting + active + delayed
    };
};

/**
 * Clear completed and failed jobs
 * @returns {Promise<void>}
 */
export const cleanQueue = async () => {
    await imageUploadQueue.clean(1000 * 60 * 60 * 24); // Remove jobs older than 24h
    console.log('[Queue] Cleaned old jobs');
};

/**
 * Pause queue
 */
export const pauseQueue = async () => {
    await imageUploadQueue.pause();
    console.log('[Queue] Paused');
};

/**
 * Resume queue
 */
export const resumeQueue = async () => {
    await imageUploadQueue.resume();
    console.log('[Queue] Resumed');
};

export default imageUploadQueue;