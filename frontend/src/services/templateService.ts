import { templateId } from "@/types"
import api from "./api"

export const getTemplateById = async (templateId: templateId) => {
    if(!templateId){
        throw new Error("TemplateId is required")
    }
    const response = await api.get(`template/get-template-details/${templateId}`);
    return response.data;
}

export const getUserTemplate = async (templateId: templateId) => {
    if(!templateId){
        throw new Error("TemplateId is required")
    }
    const response = await api.get(`template/get-single-user-template/${templateId}`);
    return response.data;
}

export const getAllUserTemplates = async () => {
    const response = await api.get('template/get-user-templates');
    return response.data;
}

export const createTemplate = async (data: any) => {
    if(!data){
        throw new Error("Data is required");
    }
    const response = await api.post(`template/upload-template`, data, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
}

export const getRandomTemplates = async () => {
    const response = await api.get('template/get-random-templates');
    return response.data;
}

export const templateByCategory = async ( category?: string, subCategory?: string, page: number = 1, limit: number = 40 ) => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (subCategory) params.append('subCategory', subCategory);
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    const response = await api.get(`/template/get-category-templates?${params.toString()}`);
    return response.data;
}

export const toggleTemplateSave = async ( templateId: templateId ) => {
    if(!templateId){
        throw new Error("TemplateId is required");
    }
    const response = await api.patch(`/savedTemplate/toggle-save-template/${templateId}`);
    return response.data;
}

export const searchTemplates = async (q: string, page: number = 1, limit: number = 40) => {
    const params = new URLSearchParams();
    params.append('q', q);
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    const response = await api.get(`/template/search-templates?${params.toString()}`);
    return response.data;
};