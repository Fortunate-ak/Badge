import { useState } from 'react'
import { Outlet, useLocation, Link, useNavigate } from "react-router";
import { AuthProvider, useAuth } from '../../context/AuthContext';

export default function Dashboard({ title = "Search Here", className = "" }: { title?: string, className?: string }) {
    const [navShow, setNavShow] = useState(true);
    const navigate = useNavigate()


    return <AuthProvider><div className='dashboard-container flex flex-row w-full h-screen p-0 *:p-2'>

        <nav className={'h-full min-w-0 flex flex-col justify-between *:w-full *:flex *:flex-col *:gap-2 *:text-left transition-all border-r border-border ' + (navShow ? "md:w-1/18 fixed top-0 left-0 md:relative p-4 md:p-2 z-10" : "w-0! p-0! z-[-90]")}>
            <div className='p-2'>
                <div className='flex flex-row justify-center items-center mb-2 size-10 rounded-full bg-primary place-self-center'>
                    <h1 className='font-semibold text-xl line-clamp-1 mso filled text-white'>verified</h1>
                </div>
                <NavItem title="Home" icon="home" path="/" />
                <NavItem title="Assets" icon="home_storage" path='/assets' />
                <NavItem title="Organisations" icon="corporate_fare" path='/organisations' />
                <NavItem title="Agents" icon="groups" path='/agents' />
                <NavItem title="Asset Classes" icon="interests" path='/asset-classes' />
                <NavItem title="Departments" icon="store" path='/departments' />
            </div>

            <ProfileButton />

        </nav>

        <div className='bg-background rounded-md flex flex-col transition-all flex-1 max-w-full'>
            <header className='flex flex-row justify-between items-center p-2 pb-0'>
                <span className='px-1 text-sm'>{title}</span>

                <div className="flex flex-row items-center gap-2">
                    <button onClick={() => { navigate("/auth/") }} className="tw-button-ghost text-xs">
                        Sign Out
                        <span className="mso"></span>
                    </button>
                </div>
            </header>

            <main className={'p-4 overflow-y-auto max-h-full flex-1 max-w-full' + className}>
                <Outlet />
            </main>
        </div>

    </div>
    </AuthProvider>
}


function NavItem({ title, icon, path = "" }: { title: string, icon: string, path?: string }) {
    const location = useLocation();

    return <Link to={path} style={{
            fontVariationSettings: `'FILL' ${path == location.pathname ? 1 : 0}`
        }} className={"py-1 px-2 rounded-md mso text-xl text-center gap-1 items-center cursor-pointer transition-colors " + (path == location.pathname ? "bg-primary text-background hover:bg-foreground" : "text-foreground hover:bg-border/50")}>
        {icon}
    </Link>
}



function ProfileButton() {
    const { user } = useAuth()
    return <div className='overflow-x-clip w-full flex items-center justify-center'>
        <button className='flex flex-row w-fit text-left gap-2'>
            <div className='tw-button rounded-full size-8 text-lg flex items-center justify-center'>
                {user?.first_name[0]}
            </div>
        </button>
    </div>
}