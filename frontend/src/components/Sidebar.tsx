import { SidebarOption } from "./SidebarOption";

export const Sidebar = () => {
    return <div className='fixed top-12 left-0 h-[calc(100vh-3rem)] w-64 border-r bg-white p-1'>
        <SidebarOption path="/dashboard" name="Dasbhoard" />
        <SidebarOption path="/emails" name="Emails" />
        <SidebarOption path="/template" name="Templates" />
        <SidebarOption path="/credentials" name="Credentials" />
    </div>
};