import {
    ChevronRight
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
export const SidebarOption = ({
    path,
    name,
    icon: Icon,
}: {
    path: string
    name: string
    icon: React.ElementType
}) => {
    const { pathname } = useLocation()

    // Active if exact match or nested route (e.g. /emails/42)
    const isActive =
        pathname === path || pathname.startsWith(path + "/")

    return (
        <Link
            to={path}
            className={`
        group flex items-center gap-3 px-3 py-2 rounded-lg text-sm
        transition-all duration-150 relative
        ${isActive
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
                }
      `}
        >
            {/* Icon */}
            <Icon
                size={16}
                className={`shrink-0 transition-colors ${isActive ? "text-white" : "text-gray-500 group-hover:text-gray-300"
                    }`}
            />

            {/* Label */}
            <span className={`font-medium ${isActive ? "text-white" : ""}`}>
                {name}
            </span>

            {/* Active indicator arrow */}
            {isActive && (
                <ChevronRight size={13} className="ml-auto text-indigo-300" />
            )}
        </Link>
    )
}
