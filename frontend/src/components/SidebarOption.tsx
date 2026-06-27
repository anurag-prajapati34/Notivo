import { Link, useLocation } from "react-router-dom";

export const SidebarOption = (props: { name: string; path: string; iconClass?: string }) => {
    const { name, path, iconClass } = props;
    const location = useLocation();

    const isActive = location.pathname === path;

    return (
        <Link
            to={path}
            key={name}
            id={name}
            className={`flex cursor-pointer justify-start text-start py-2 px-4 items-center mb-1
        ${isActive ? "text-gray-600 bg-gray-300 border border-gray-600" : "text-gray-600 hover:bg-gray-300 hover:border hover:border-gray-600"}`}
        >
            {iconClass && <i className={iconClass}></i>}
            <span className="ml-2">{name}</span>
        </Link>
    );
};
