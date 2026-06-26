import { createContext, useState } from "react";
import type { User } from "../types";
import { getAuthTokenKey } from "../utils/auth-helpers";


interface AuthContextType {
    user: User | null
    setUser: React.Dispatch<React.SetStateAction<User | null>>
    isLoggedIn: boolean
    setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>
    checkAuth: () => void
}
export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const checkAuth = () => {
        const token = localStorage.getItem(getAuthTokenKey());
        if (token) {
            setIsLoggedIn(true);
        }
    }
    return (
        <AuthContext.Provider value={{
            user,
            setUser,
            isLoggedIn,
            setIsLoggedIn,
            checkAuth

        }} >
            {children}
        </AuthContext.Provider>
    )
}
