import axios from 'axios';
import { ApiError } from './apiError.js'; // Assuming this is defined and imported correctly

import { GEMINI_API_KEY, GEMINI_API_URL } from '../config/env.js';

const GEMINI_API_KEY = GEMINI_API_KEY;
// Use the recommended model URL if GEMINI_API_URL is not provided
const GEMINI_API_URL = GEMINI_API_URL || "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent";
const MAX_REQUESTS_PER_MINUTE = 5;
const WINDOW_MS = 60000; // 60 seconds



const captionCache = new Map();
let requestTimestamps = [];



export const geminiClient = async (prompt, options = {}) => {
    
    if (!GEMINI_API_KEY || !GEMINI_API_URL) {
        throw new ApiError(500, "Server configuration error: Missing GEMINI_API_KEY or URL.");
    }
    
    const cacheKey = `${prompt}_${JSON.stringify(options)}`;

    if (captionCache.has(cacheKey)) {
        console.log("Gemini Cache Hit.");
        return captionCache.get(cacheKey);
    }

    const now = Date.now();
    
    requestTimestamps = requestTimestamps.filter(ts => now - ts < WINDOW_MS);
    if (requestTimestamps.length >= MAX_REQUESTS_PER_MINUTE) {
        throw new ApiError(429, "Rate limit exceeded. Try again later.");
    }
    requestTimestamps.push(now);

    try {
        const requestPayload = {
            contents: [{ role: "user", parts: [{ text: prompt }] }],
        };

        let generationConfig = {};

        
        if (options.responseSchema) {
            generationConfig = {
                responseMimeType: "application/json",
                responseSchema: options.responseSchema,
            };
        }
        
        if (options.temperature !== undefined) generationConfig.temperature = options.temperature;
        if (options.maxOutputTokens !== undefined) generationConfig.maxOutputTokens = options.maxOutputTokens;

        if (Object.keys(generationConfig).length > 0) {
            requestPayload.generationConfig = generationConfig;
        }

        console.log("Sending request to Gemini. Schema used:", !!options.responseSchema);

        const response = await axios.post(
            `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
            requestPayload,
            {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 100000 // 100 second timeout
            }
        );

        const text = response?.data?.candidates?.[0]?.content?.parts?.map(p => p.text).join(' ');

        if (!text) {
            console.error("Gemini API Response (No Text):", response?.data);
            throw new ApiError(500, "No valid response from Gemini");
        }

        console.log("Gemini response received. Length:", text.length);


        captionCache.set(cacheKey, text);

        return text;

    } catch (error) {
        console.error("Gemini client error:", error?.response?.data || error?.message);
        
        if (axios.isAxiosError(error) && error.response) {
            const apiErrorMsg = error.response?.data?.error?.message || error.message;
            
            if (error.response.status === 400) {
                throw new ApiError(400, `Gemini API error: Invalid request structure or content. Detail: ${apiErrorMsg}`);
            }
            if (error.response.status === 429) {
                throw new ApiError(429, "Gemini API rate limit exceeded. Please try again later.");
            }
            if (error.response.status === 403 || error.response.status === 401) {
                throw new ApiError(401, "Gemini API authentication failed. Check API key validity.");
            }
            
        
            throw new ApiError(error.response.status, `Gemini API call failed with status ${error.response.status}: ${apiErrorMsg}`);
        }

        throw new ApiError(500, "Failed to generate content from Gemini due to network or timeout error.");
    }
};