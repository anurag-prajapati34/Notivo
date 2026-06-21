import { SidebarOption } from "./SidebarOption";

export const Sidebar = () => {
    return <div className='w-1/6 bg-black h-screen text-white rounded-lg p-2 mr-1'>
        <SidebarOption path="/emails" name="Emails" />
        <SidebarOption path="/dashboard" name="Dasbhoard" />
        <SidebarOption path="/template" name="Templates" />
        {/* <SidebarOption name="API Keys" />
        <SidebarOption name="Settings" />
        <SidebarOption name="Logs" /> */}
    </div>
};