import { Link } from "react-router-dom";

export const SidebarOption = (props: { name: string, path: string }) => {
    const { name, path } = props
    return <div className=" hover:cursor-pointer m-3 text-lg">
        <Link to={path} >{name}</Link >
    </div>
};