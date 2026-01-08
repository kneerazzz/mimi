import api from "./api";

export const registerUser = async ( data: any ) => {
    const response = await api.post("/users/register", data);
    return response.data
}

export const loginUser = async ( data: any ) => {
    const response = await api.post("/users/login", data);
    return response.data
}

export const logoutUser = async () => {
    const response = await api.post("/users/logout");
    return response.data
}

export const getCurrentUser = async () => {
    const response = await api.get("/users/get-user-details");
    return response.data
}