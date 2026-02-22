import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

export const healthCheck = asyncHandler (async (req, res) => {
    try {
        const dbStatus = mongoose.connection.readyState;
        if(dbStatus === 1){
            return res
            .status(200)
            .json(new ApiResponse(200, {server: "Online", database: "Connected", timestamp: new Date().toISOString()}, "Server is healthy"))
        }
        else {
            return res
            .status(503)
            .json(new ApiResponse(503, {server: "Online", database: "Connecting/Disconnected", timestamp: new Date().toISOString()}, "Server is unhealthy"))
        }
    } catch (error) {
        console.error("Health check failed:", error);
        throw new ApiError(500, "Server is unhealthy")
    }
})
