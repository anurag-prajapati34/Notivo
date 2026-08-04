import { createContext, useState } from "react";
import type { User } from "../types";
import { getAuthTokenKey, getAuthUser, getAuthUserKey } from "../utils/auth-helpers";


interface AuthContextType {
    user: User | null
    isLoggedIn: boolean
    logout: () => void
    setUser: React.Dispatch<React.SetStateAction<User | null>>
}
export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(() => {
        const token = localStorage.getItem(getAuthTokenKey());
        return token ? getAuthUser() : null;
    });

    const isLoggedIn = !!user;

    const logout = () => {
        localStorage.removeItem(getAuthTokenKey());
        localStorage.removeItem(getAuthUserKey());
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            isLoggedIn,
            logout,
            setUser

        }} >
            {children}
        </AuthContext.Provider>
    )
}
