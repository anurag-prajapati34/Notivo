import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuthContext } from "../hooks";
import { Sidebar } from "../components/Sidebar";
import { TopBar } from "../components/TopBar";

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
        <div className="h-screen overflow-hidden">
            <TopBar />

            <div className="flex pt-12 h-full">
                <Sidebar />

                <main className="ml-64 flex-1 overflow-y-auto p-4 bg-gray-50">
                    <Outlet />
                </main>
            </div>
        </div>
    )
};