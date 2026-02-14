import api from "./api";


export const changePassword = async ( data: any ) => {
    const response = await api.post("/users/update-user-password", data);
    return response.data
}

export const updateProfile = async ( data: any ) => {
    const response = await api.patch("/users/update-user-details", data);
    return response.data
}

export const deleteAccount = async (data: any) => {
    const response = await api.delete("/users/delete-account", data);
    return response.data
} 
export const getUserDetails = async ( userName: string ) => {
    const response = await api.get(`/users/get-user/${userName}`);
    return response.data
}

export const changeProfilePicture = async ( data: FormData ) => {
    const response = await api.patch("/users/change-profile-pic", data, {
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        transformRequest: [(data) => data], // Prevent axios from transforming FormData
    });
    return response.data
}

export const sendPasswordChangeEmail = async ( email: string ) => {
    const response = await api.post("/users/send-password-reset-email", { email });
    return response.data
}

export const resetPassword = async ( data: any ) => {
    const response = await api.post("/users/reset-password", data);
    return response.data
}   