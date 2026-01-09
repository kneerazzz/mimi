import api from "./api"
import { HomePageParams, memeId, commentId } from "@/types";

export type ContentType = "MemeFeedPost" | "CreatedMeme";

export const getHomeMemes = async (  pageNum : number  ) => {
    if(pageNum < 1){
        throw new Error("Page must be >=1")
    }
    const response = await api.get(`/memes/homepage?page=${pageNum}`)
    return response.data;
}

export const getRedditMemeDetails = async ( memeId: memeId, type: ContentType = "MemeFeedPost" ) => {
    if(!memeId){
        throw new Error("MemeId is required")
    }
    const response = await api.get(`/memes/details/${memeId}/${type}`)
    return response.data;
}

export const toggleLike = async ( memeId: memeId, type: ContentType) => {
    if(!memeId){
        throw new Error("MemeId is required");
    }
    const response = await api.patch(`/like/toggle-like/${memeId}/${type}`)
    return response.data;
}

export const getLikedMemes = async () => {
    const response = await api.get("/like/get-liked-memes");
    return response.data;
}

export const toggleSave = async (memeId: memeId, type: ContentType) => {
    if(!memeId){
        throw new Error("MemeId is required");
    }
    const response = await api.patch(`/save/toggle-save/${memeId}/${type}`);
    return response.data;
}

export const getSavedMemes = async () => {
    const response = await api.get("/save/get-saved-memes");
    return response.data;
}


export const addComment = async (data: any, memeId: memeId, type: ContentType) => {
    if(!memeId){
        throw new Error("MemeId is required")
    }
    if(!data){
        throw new Error("Content is required")
    }
    const response = await api.post(`/comment/add-comment/${memeId}/${type}`, data)
    return response.data;
}

export const updateComment = async(data: any, commentId: commentId) => {
    if(!data){
        throw new Error("Content is required")
    }
    if(!commentId){
        throw new Error("MemeId is required")
    }
    const response = await api.patch(`/comment/update-comment/${commentId}`, data);
    return response.data;
} 

export const getAllComments = async(memeId: memeId, type: ContentType) => {
    const response = await api.get(`/comment/get-all-comments/${memeId}/${type}`)
    return response.data;
}

export const getCommentReplies = async(commentId: commentId) => {
    if(!commentId){
        throw new Error("Parent Comment Id is required")
    }
    const response = await api.get(`/comment/get-comment-replies/${commentId}`)
    return response.data;
}

export const deleteComment = async(commentId: commentId) => {
    if(!commentId){
        throw new Error("Comment Id is required")
    }
    const response = await api.delete(`/comment/delete-comment/${commentId}`)
    return response.data;
}


