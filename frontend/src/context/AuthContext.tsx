'use client'
import React, { createContext, useContext, useState, useEffect} from "react";
import api from "@/services/api";
import { toast } from "sonner";

interface User {
    _id: string;
    uuid: string;
    username?: string;
    email?: string;
    name?: string;
    is_registered: boolean;
    profilePic?: string;
    bio: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (data: any) => Promise<void>;
    logout: () => Promise<void>;
    showLoginModal: boolean;
    setShowLoginModal: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showLoginModal, setShowLoginModal] = useState(false);


    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { data } = await api.get("/users/get-user-details");
                setUser(data.data.user)
            } catch (error) {
                toast.error("Error fetching user!")
                setUser(null)
            } finally {
                setIsLoading(false)
            }
        }
        checkAuth();
    }, []);

    const login = async (credentials: any) => {
        const { data } = await api.post("/users/login", credentials);
        setUser(data.data.user);
        setShowLoginModal(false)
    }

    const logout = async () => {
        await api.post("/users/logout");
        setUser(null);
        window.location.reload();
    };
    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout, showLoginModal, setShowLoginModal}} >
            { children }
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if(!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
}