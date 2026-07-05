import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { TopBar } from "../components/TopBar";
import { useAuthContext } from "../hooks";

export const Home = () => {
    const { isLoggedIn, checkAuth } = useAuthContext()
    const navigate = useNavigate();
    checkAuth();
    useEffect(() => {
        if (!isLoggedIn) {
            navigate('/login')
        } else {
            navigate('/')
        }
    }, [])
    return (
        <div className="h-screen overflow-hidden">
            <TopBar />

            <div className="flex pt-12 h-full">
                <Sidebar />

                <main className=" flex-1 overflow-y-auto p-4 ">
                    <Outlet />
                </main>
            </div>
        </div>
    )
};