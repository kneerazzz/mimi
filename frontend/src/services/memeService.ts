import api from "./api"
import { HomePageParams, memeId, commentId } from "@/types";


export const getHomeMemes = async ( { page }: HomePageParams  ) => {
    if(page < 1){
        throw new Error("Page must be >=1")
    }
    const response = await api.get(`/memes/homepage?page=${page}`)
    return response.data;
}

export const getRedditMemeDetails = async ( memeId: memeId ) => {
    if(!memeId){
        throw new Error("MemeId is required")
    }
    const response = await api.get(`/memes/details/${memeId}/MemeFeedPost`)
    return response.data;
}

export const toggleLike = async ( memeId: memeId ) => {
    if(!memeId){
        throw new Error("MemeId is required");
    }
    const response = await api.patch(`/like/toggle-like/${memeId}/MemeFeedPost`)
    return response.data;
}

export const getLikedMemes = async () => {
    const response = await api.get("/like/get-liked-memes");
    return response.data;
}

export const toggleSave = async (memeId: memeId) => {
    if(!memeId){
        throw new Error("MemeId is required");
    }
    const response = await api.patch(`/save/toggle-save/${memeId}/MemeFeedPost`);
    return response.data;
}

export const getSavedMemes = async () => {
    const response = await api.get("/save/get-saved-memes");
    return response.data;
}


export const addComment = async (data: any, memeId: memeId) => {
    if(!memeId){
        throw new Error("MemeId is required")
    }
    if(!data){
        throw new Error("Content is required")
    }
    const response = await api.post(`/comment/add-comment/${memeId}/MemeFeedPost`, data)
    return response.data;
}

export const updateComment = async(data: any, commentId: commentId) => {
    if(!data){
        throw new Error("Content is required")
    }
    if(!commentId){
        throw new Error("MemeId is required")
    }
    const response = await api.patch(`/comment/update-comment/${commentId}`);
    return response.data;
} 

export const getAllComments = async(memeId: memeId) => {
    const response = await api.get(`/comment/get-all-comments/${memeId}/MemeFeedPost`)
}