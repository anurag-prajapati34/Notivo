import { ChevronDown, LogOut, Settings, Zap } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuthContext } from "../hooks"

export const TopBar = () => {
    const { user, logout } = useAuthContext()
    const navigate = useNavigate()
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false)
            }
        }
        document.addEventListener("mousedown", handler)
        return () => document.removeEventListener("mousedown", handler)
    }, [])

    const handleLogout = () => {
        logout()
        navigate("/")
    }

    // Get initials from name
    const initials = user?.firstName
        ? user.firstName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
        : "U"

    return (
        <header className="fixed top-0 left-0 right-0 z-50 h-12 bg-gray-400 border-b border-gray-800 flex items-center justify-between px-4  text-white">

            {/* Left — Logo */}
            <div onClick={() => navigate('/intro')} className="flex items-center gap-2 w-56">
                <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center shrink-0">
                    <Zap size={13} className="text-white" />
                </div>
                <span className="text-sm font-semibold text-white tracking-tight">
                    Notivo
                </span>
                {/* <span className="ml-1 text-xs px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800 font-medium">
                    beta
                </span> */}
            </div>

            {/* Center — Current page breadcrumb */}
            {/* <div className="flex-1 flex items-center justify-center">
                <PageIndicator />
            </div> */}

            {/* Right — Actions + User */}
            <div className="flex items-center gap-2 w-56 justify-end">

                {/* Docs link */}
                {/* <a
                    href="https://docs.notivo.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-7 px-2.5 rounded-md text-xs  text-white font-semibold hover:text-gray-200 hover:bg-gray-800 transition-colors flex items-center"
                >
                    Docs
                </a> */}

                {/* Divider */}
                <div className="w-px h-4 bg-gray-800" />

                {/* User dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setDropdownOpen((p) => !p)}
                        className="flex items-center gap-2 h-8 pl-1.5 pr-2 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        {/* Avatar */}
                        <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
                            <span className="text-xs font-semibold text-white leading-none">
                                {initials}
                            </span>
                        </div>

                        {/* Name */}
                        <span className="text-xs text-gray-300 max-w-[100px] truncate">
                            {user?.firstName ?? "Account"}
                        </span>

                        <ChevronDown
                            size={12}
                            className={`text-gray-500 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                        />
                    </button>

                    {/* Dropdown menu */}
                    {dropdownOpen && (
                        <div className="absolute right-0 top-full mt-1.5 w-56 bg-gray-900 border border-gray-800 rounded-xl shadow-xl overflow-hidden z-50">

                            {/* User info */}
                            <div className="px-4 py-3 border-b border-gray-800">
                                <p className="text-xs font-medium text-gray-200 truncate">
                                    {user?.firstName ?? "User"}
                                </p>
                                <p className="text-xs text-gray-500 truncate mt-0.5">
                                    {user?.email ?? ""}
                                </p>
                            </div>

                            {/* Menu items */}
                            <div className="py-1">
                                <button
                                    onClick={() => { navigate("/settings"); setDropdownOpen(false) }}
                                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-gray-400 hover:text-gray-200 hover:bg-gray-800 transition-colors"
                                >
                                    <Settings size={13} />
                                    Settings
                                </button>
                            </div>

                            <div className="border-t border-gray-800 py-1">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-gray-800 transition-colors"
                                >
                                    <LogOut size={13} />
                                    Sign out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}

// ─── Page indicator ───────────────────────────────────────────────────────────
// Shows current page name based on URL — subtle, clean

// import { useLocation } from "react-router-dom"

// const pageNames: Record<string, string> = {
//     "/dashboard": "Dashboard",
//     "/emails": "Emails",
//     "/templates": "Templates",
//     "/settings": "Settings",
// }

// const PageIndicator = () => {
//     const { pathname } = useLocation()

//     // Match exact or startsWith for nested routes like /emails/42
//     const match = Object.entries(pageNames).find(([path]) =>
//         pathname === path || pathname.startsWith(path + "/")
//     )

//     if (!match) return null

//     const [, name] = match

//     return (
//         <span className="text-xs text-gray-500 font-medium">
//             {name}
//         </span>
//     )
// }