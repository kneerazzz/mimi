'use client'
import React, { createContext, useContext, useState, useEffect} from "react";
import api from "@/services/api";
import { getCurrentUser, loginUser, logoutUser, registerUser } from "@/services/authService";
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
    register: (data: any) => Promise<void>;
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
                const response = await getCurrentUser();
                setUser(response.data.user)
            } catch (error) {
                console.log("Visitor Mode (User not logged In)")
                setUser(null)
            } finally {
                setIsLoading(false)
            }
        }
        checkAuth();
    }, []);

    const login = async (credentials: any) => {
        const response = await loginUser(credentials);
        setUser(response.data.user);
        setShowLoginModal(false)
        toast.success(`Welcome Back, ${response.data.user.username}`)
    }

    const logout = async () => {
        await logoutUser();
        setUser(null);
        window.location.reload();
    };

    const register = async (credentials: any) => {
        const response = await registerUser(credentials)
        setUser(response.data.user);
        toast.success(`Welcome aboard, ${response.data.user.username}`);
        setShowLoginModal(false);
    }
    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout, register, showLoginModal, setShowLoginModal}} >
            { children }
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if(!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
}