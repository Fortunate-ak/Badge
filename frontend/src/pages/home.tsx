import React from "react";
import { GetCurrentUser } from "../utils/auth"
import type { User } from "../types";
import { Link } from "react-router";
import viteLogo from '/vite.svg';

export default function HomePage() {
    const [currentUser, setCurrentUser] = React.useState<User | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        GetCurrentUser()
            .then(user => setCurrentUser(user))
            .finally(() => setIsLoading(false));
    }, [])

    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 flex flex-col">
            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-border/40 bg-background/80 px-6 py-4 flex justify-between items-center transition-all duration-300">
                <Link to="/" className="flex items-center gap-2 group hover:opacity-80 transition-opacity">
                    <img src={viteLogo} className="h-8 w-8" alt="Badge Logo" />
                    <span className="font-bold text-xl tracking-tight text-foreground">Badge</span>
                </Link>
                <div className="flex gap-4 items-center">
                    {!isLoading && (
                        currentUser ? (
                            <Link to={currentUser.is_institution_staff ? "/institution" : "/applicant"} className="tw-button shadow-sm hover:shadow transition-shadow">
                                Dashboard <span className="mso ml-2 text-sm">arrow_forward</span>
                            </Link>
                        ) : (
                            <>
                                <Link to="/auth" className="hidden md:inline-flex text-sm font-medium text-subtle-text hover:text-foreground transition-colors">Log in</Link>
                                <Link to="/auth/register" className="tw-button bg-foreground text-background hover:bg-foreground/90 border-transparent shadow-none px-4 py-2 rounded-lg text-sm">Sign up</Link>
                            </>
                        )
                    )}
                </div>
            </nav>

            {/* Hero Section */}
            <main className="flex-grow flex flex-col relative pt-24 pb-16 lg:pt-36 lg:pb-24 overflow-hidden">
                {/* Background Blobs (Subtler) */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none z-0">
                    <div className="absolute top-20 left-10 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
                    <div className="absolute top-40 right-10 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px]" />
                </div>

                <div className="container mx-auto px-6 relative z-10 text-center max-w-4xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/50 border border-border/50 text-xs font-medium text-subtle-text mb-6">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
                        Universal Verification System v1.0
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 text-foreground leading-[1.1]">
                        The Future of <br className="hidden md:block"/> Verified Credentials.
                    </h1>
                    <p className="text-lg md:text-xl text-subtle-text max-w-2xl mx-auto mb-10 leading-relaxed">
                        Connect applicants with opportunities through a trusted, consent-driven platform.
                        Say goodbye to manual verification and hello to instant trust.
                    </p>

                    {!currentUser && (
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                            <Link to="/auth/register" className="tw-button h-11 px-6 text-base shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all w-full sm:w-auto">
                                Get Started
                            </Link>
                            <Link to="/docs" className="tw-button-secondary h-11 px-6 text-base hover:bg-secondary/80 transition-colors w-full sm:w-auto">
                                Documentation
                            </Link>
                        </div>
                    )}

                     {/* Split Selection Section (Simplified) */}
                    {!currentUser && (
                        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto text-left">
                            {/* Applicant Card */}
                            <Link to="/auth/register" className="group relative bg-card hover:bg-secondary/30 border border-border/50 rounded-2xl p-6 transition-all hover:shadow-lg hover:shadow-primary/5">
                                <div className="relative z-10">
                                    <div className="h-12 w-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-4 transition-transform duration-300">
                                        <span className="mso text-2xl filled">person</span>
                                    </div>
                                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">For Applicants</h3>
                                    <p className="text-subtle-text mb-4 text-sm leading-relaxed">
                                        Build your verified portfolio. Apply to jobs, programs, and scholarships with a single click.
                                    </p>
                                    <span className="inline-flex items-center text-primary text-sm font-semibold group-hover:gap-2 transition-all">
                                        Create Account <span className="mso text-sm ml-1 transition-transform group-hover:translate-x-1">arrow_forward</span>
                                    </span>
                                </div>
                            </Link>

                            {/* Institution Card */}
                            <Link to="/auth/register?type=institution" className="group relative bg-card hover:bg-secondary/30 border border-border/50 rounded-2xl p-6 transition-all hover:shadow-lg hover:shadow-purple-500/5">
                                <div className="relative z-10">
                                    <div className="h-12 w-12 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center mb-4 transition-transform duration-300">
                                        <span className="mso text-2xl filled">apartment</span>
                                    </div>
                                    <h3 className="text-xl font-bold mb-2 group-hover:text-purple-600 transition-colors">For Institutions</h3>
                                    <p className="text-subtle-text mb-4 text-sm leading-relaxed">
                                        Verify documents instantly. Find the best talent with our AI-powered recommendation engine.
                                    </p>
                                    <span className="inline-flex items-center text-purple-600 text-sm font-semibold group-hover:gap-2 transition-all">
                                        Create Account <span className="mso text-sm ml-1 transition-transform group-hover:translate-x-1">arrow_forward</span>
                                    </span>
                                </div>
                            </Link>
                        </div>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="py-6 border-t border-border/40 text-center text-subtle-text text-xs bg-background/50 backdrop-blur-sm">
                <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
                     <p>&copy; {new Date().getFullYear()} Badge System. All rights reserved.</p>
                     <div className="flex gap-6">
                         <Link to="#" className="hover:text-foreground transition-colors">Privacy</Link>
                         <Link to="#" className="hover:text-foreground transition-colors">Terms</Link>
                         <Link to="#" className="hover:text-foreground transition-colors">Contact</Link>
                     </div>
                </div>
            </footer>

        </div>
    )
}
