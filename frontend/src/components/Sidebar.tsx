import { SidebarOption } from "./SidebarOption";
export const Sidebar = () => {
    return <div className='fixed top-12 left-0 h-[calc(100vh-3rem)]  p-2 w-50 border-r bg-white'>
        <SidebarOption path="/dashboard" name="Dasbhoard" iconClass="fa-solid fa-chart-simple" />
        <SidebarOption path="/emails" name="Emails" iconClass="fa-solid fa-envelope" />
        <SidebarOption path="/template" name="Templates" iconClass="fa-solid fa-folder-tree" />
        <SidebarOption path="/credentials" name="Credentials" iconClass="fa-solid fa-key" />
    </div>
};