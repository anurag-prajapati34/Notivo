// ─── components/layout/Sidebar.tsx ───────────────────────────────────────────

import {
    LayoutDashboard,
    LayoutTemplate,
    Mail,
    Send,
    Settings
} from "lucide-react"
import { SidebarOption } from "./SidebarOption"

// ─── Nav items config ─────────────────────────────────────────────────────────

const navItems = [
    {
        path: "/",
        name: "Dashboard",
        icon: LayoutDashboard,
    },
    {
        path: "/emails",
        name: "Emails",
        icon: Mail,
    },
    {
        path: "/templates",
        name: "Templates",
        icon: LayoutTemplate,
    },
    {
        path: "/send-email",
        name: "Send email",
        icon: Send,
    },
    {
        path: "/settings",
        name: "Settings",
        icon: Settings,
    },
]

// ─── Sidebar option ───────────────────────────────────────────────────────────



// ─── Sidebar ──────────────────────────────────────────────────────────────────

export const Sidebar = ({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) => {
    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/40 md:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar Drawer Container */}
            <div
                className={`
                    fixed md:relative top-12 md:top-0 left-0 h-[calc(100vh-3rem)] md:h-[calc(100vh-3rem)] w-52 bg-white border-r border-gray-800 flex flex-col z-50 md:z-auto
                    transition-transform duration-300 ease-in-out
                    ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
                `}
            >

                {/* Nav items */}
                <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
                    {/* <p className="text-xs font-medium text-gray-600 uppercase tracking-wider px-3 mb-3">
                        Navigation
                    </p> */}
                    {navItems.map((item) => (
                        <SidebarOption
                            key={item.path}
                            path={item.path}
                            name={item.name}
                            icon={item.icon}
                            onClick={onClose}
                        />
                    ))}
                </nav>

                {/* Bottom — version tag */}
                <div className="px-4 py-4 border-t border-gray-800">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-xs text-gray-600">All systems operational</span>
                    </div>
                    <p className="text-xs text-gray-700 mt-1.5 pl-3.5">v1.0.0-beta</p>
                </div>
            </div>
        </>
    )
}