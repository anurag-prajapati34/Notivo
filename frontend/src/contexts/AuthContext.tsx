import { createContext, useState } from "react";
import type { User } from "../types";

interface AuthContextType {
    user: User | null
    setUser: React.Dispatch<React.SetStateAction<User | null>>
    isLoggedIn: boolean
    setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>
}
export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    return (
        <AuthContext.Provider value={{
            user,
            setUser,
            isLoggedIn,
            setIsLoggedIn

        }} >
            {children}
        </AuthContext.Provider>
    )
}
