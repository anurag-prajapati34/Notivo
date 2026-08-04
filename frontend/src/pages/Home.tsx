import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { TopBar } from "../components/TopBar";
import { useAuthContext } from "../hooks";

export const Home = () => {
    const { isLoggedIn } = useAuthContext()
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    useEffect(() => {
        if (!isLoggedIn) {
            navigate('/login')
        } else {
            navigate('/')
        }
    }, [])
    return (
        <div className="h-screen overflow-hidden">
            <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

            <div className="flex pt-12 h-full">
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

                <main className=" flex-1 overflow-y-auto p-4 ">
                    <Outlet />
                </main>
            </div>
        </div>
    )
};