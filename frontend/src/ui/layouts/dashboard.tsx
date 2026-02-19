import { Outlet, useLocation, Link, useNavigate } from "react-router";
import { AuthProvider, useAuth } from '../../context/AuthContext';
import { SearchProvider, useSearch } from '../../context/SearchContext';

export default function Dashboard({ title = "Badge", className = "" }: { title?: string, className?: string }) {
    const navigate = useNavigate()

    return <AuthProvider>
        <SearchProvider>
            <div className='dashboard-container flex flex-row w-full h-screen p-0 *:p-2'>

                <nav className={'h-full min-w-0 md:flex hidden flex-col justify-between *:w-full *:flex *:flex-col *:gap-2 *:text-left transition-all border-r border-border'}>
                    <div className='p-2'>
                        <div className='flex flex-row justify-center items-center mb-2 size-10 rounded-full bg-primary place-self-center'>
                            <h1 className='font-semibold text-xl line-clamp-1 mso filled text-white'>verified</h1>
                        </div>
                        <Navigations />
                    </div>

                    <ProfileButton />

                </nav>


                <nav className='flex items-center justify-center z-10 md:hidden fixed bottom-4 w-full'>
                    <div className='bg-primary empty:bg-transparent *:text-white rounded-r-full rounded-l-full flex flex-row items-center justify-around gap-4 p-3 shadow-lg w-3/4'>
                        <Navigations />
                    </div>
                </nav>

                <div className='bg-background rounded-md flex flex-col transition-all flex-1 max-w-full'>
                    <header className='flex flex-row justify-between items-center p-2'>
                        <span className='px-1 text-sm'>{title}</span>

                        <SearchBar />

                        <div className="flex flex-row items-center gap-2">
                            <button onClick={() => { navigate("/auth/") }} className="tw-button-ghost text-xs">
                                Sign Out
                                <span className="mso"></span>
                            </button>
                        </div>
                    </header>

                    <main className={'p-4 overflow-y-auto max-h-full flex-1 max-w-full pb-24' + className}>
                        <Outlet />
                    </main>
                </div>

            </div>
        </SearchProvider>
    </AuthProvider>
}


function SearchBar() {
    const { isSearchVisible, searchValue, setSearchValue } = useSearch();

    if (!isSearchVisible) return null;

    return (
        <div className="flex-1 mx-4 max-w-md relative flex items-center">
            <span className="absolute left-2 text-muted-foreground text-sm mso">search</span>
            <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search..."
                className="tw-input w-full pl-8 py-1 text-sm rounded-full bg-secondary/20 border-none focus:ring-1 focus:ring-primary"
            />
        </div>
    );
}


function Navigations() {

    const { user } = useAuth();
    const location = useLocation();

    // applicant
    if (user && !user.is_institution_staff && !location.pathname.includes("institution")) return <>
        <NavItem title="Home (Documents)" icon="home" path="/applicant" />
        <NavItem title="Opportunities" icon="explore" path='/opportunities' />
        <NavItem title="Consent" icon="order_approve" path='/applicant/consent' />
        <NavItem title="Profile" icon="person" path='/applicant/profile' />
    </>

    // institution
    else if (user && user.is_institution_staff && location.pathname.includes("institution")) return <>
        <NavItem title="Home (Opportunities)" icon="home" path="/institution" />
        <NavItem title="Applicants" icon="group" path='/institution/staff' />
        <NavItem title="Verifications" icon="order_approve" path='/institution/documents' />
        <NavItem title="Developer API" icon="api" path='/institution/developer' />
        <NavItem title="Profile" icon="person" path={`/institution/${user?.institution_details?.[0]?.id || ""}`} />
    </>


    else return <></>
}


function NavItem({ title, icon, path = "" }: { title: string, icon: string, path?: string }) {
    const location = useLocation();

    return <Link to={path} title={title} style={{
        fontVariationSettings: `'FILL' ${path == location.pathname ? 1 : 0}`
    }} className={"py-1 px-2 rounded-md mso text-xl text-center gap-1 items-center cursor-pointer transition-all text-foreground hover:bg-border/50"}>
        {icon}
    </Link>
}



function ProfileButton() {
    const { user } = useAuth()
    return <div title={user?.first_name + " " + user?.last_name} className='overflow-x-clip w-full flex items-center justify-center'>
        {
            user?.profile_image ? <img src={user?.profile_image} alt="Profile" className={'rounded-full size-8 object-cover border-2' + (user?.is_institution_staff ? "border-primary" : "border-border")} />
            : <div className={'rounded-full size-8 text-sm flex items-center justify-center p-2 bg-secondary text-foreground border border-border ' + (user?.is_institution_staff ? "bg-primary! text-white" : "")}>
                {user?.first_name[0]}
            </div>
        }
    </div>
}
