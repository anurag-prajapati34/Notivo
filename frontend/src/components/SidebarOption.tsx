import { Link } from "react-router-dom";

export const SidebarOption = (props: { name: string, path: string }) => {
    const { name, path } = props
    return <main className="flex cursor-pointer  hover:bg-gray-300 hover:border hover:border-gray-600 justify-start text-start p-2">
        <Link to={path} >{name}</Link >
    </main>
};