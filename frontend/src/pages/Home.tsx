import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuthContext } from "../hooks";
import { Sidebar } from "../components/Sidebar";

export const Home = () => {
    const { isLoggedIn, checkAuth } = useAuthContext()
    const navigate = useNavigate();
    checkAuth();
    useEffect(() => {
        console.log("isLoggedIn", isLoggedIn)
        if (!isLoggedIn) {
            navigate('/login')
        } else {
            navigate('/')
        }
    }, [])
    console.log("HOme isLoggedIn----", isLoggedIn)
    return (
        <div className="w-full h-full p-1 flex">
            <Sidebar />
            <main className="flex-1 p-4">
                <Outlet />
            </main>
        </div>
    )
};