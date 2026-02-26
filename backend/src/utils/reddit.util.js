import axios from 'axios';

const REDDIT_BASE_URL = "https://www.reddit.com";

// 1. Array of diverse, higher-quality, and Indian subreddits
const SUBREDDITS_LIST = [
    "dankmemes",
    "shitposting",       // For unhinged/goated memes
    "me_irl",
    "IndianDankMemes",   // Top tier Indian memes
    "SaimanSays",        // Classic Indian meme community
    "FingMemes",
    "dankinindia"
];

// Join them with a '+' so Reddit combines the feeds automatically
const TARGET_SUBREDDITS = SUBREDDITS_LIST.join("+"); 

/**
 * Filters the raw Reddit data, extracts essential fields, and cleans the post IDs.
 * @param {Array} children - Array of post objects from the Reddit response data.
 * @returns {Array} - Clean array of meme post objects ready for Mongoose insertion.
 */
const processRedditData = (children) => {
    const now = new Date();

    return children
        .map(child => child.data)
        .filter(data => 
            data.is_self === false &&
            (data.post_hint === 'image' || data.post_hint === 'link') &&
            data.url_overridden_by_dest && 
            !data.is_video
        )
        .map(data => ({
            redditPostId: data.name.startsWith('t3_') ? data.name.substring(3) : data.name,
            contentUrl: data.url_overridden_by_dest,
            title: data.title || '',
            subreddit: data.subreddit,
            author: data.author || '[deleted]',
            originalScore: data.score,
            lastCachedAt: now,
        }));
};

/**
 * Fetches the hottest memes from multiple combined subreddits and returns clean data.
 * @param {number} limit - The number of posts to fetch.
 * @returns {Array} - An array of cleaned meme post objects.
 */
const fetchMemeFeedFromReddit = async (limit = 100) => {
    // 2. Inject the combined subreddits into the URL
    const url = `${REDDIT_BASE_URL}/r/${TARGET_SUBREDDITS}/hot.json?limit=${limit}`;

    try {
        const response = await axios.get(url, {
            headers: {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36'}
        });
        
        const children = response.data?.data?.children;
        if (!children || children.length === 0) {
            console.warn("Reddit fetch succeeded but returned no posts.");
            return [];
        }

        return processRedditData(children);

    } catch (error) {
        console.error(`Error fetching data from Reddit API: ${error.message}`);
        return [];
    }
};

export { fetchMemeFeedFromReddit };
