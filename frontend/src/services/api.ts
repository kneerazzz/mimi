import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1"


const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json"
    }
});


interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

api.interceptors.response.use(
    (response) => {
        return response
    },
    async (error: AxiosError) => {
        const originalRequest = error.config as CustomAxiosRequestConfig

        if(error?.response?.status === 401 && !originalRequest._retry){
            originalRequest._retry = true
        }
        try {
            console.log("Access Token expired. Attempting refresh")

            await axios.post(
                `${API_URL}/users/refresh-access-token`,
                {},
                { withCredentials: true }
            )

            console.log("Refresh successfull. Retrying original request")

            return api(originalRequest)
            
        } catch (refreshError) {
            console.error("Refresh failed. User session is invalid")
            return Promise.reject(refreshError)
        }
    }
)


export default api;