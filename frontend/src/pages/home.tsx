import React from "react";
import { GetCurrentUser } from "../utils/auth"
import type { User } from "../types";
import { Link } from "react-router";

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
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
                         <span className="mso text-white text-2xl">verified_user</span>
                    </div>
                    <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">Badge</span>
                </Link>
                <div className="flex gap-4 items-center">
                    {!isLoading && (
                        currentUser ? (
                            <Link to={currentUser.is_institution_staff ? "/institution" : "/applicant"} className="tw-button shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow">
                                Go to Dashboard <span className="mso ml-2 text-sm">arrow_forward</span>
                            </Link>
                        ) : (
                            <>
                                <Link to="/auth" className="hidden md:inline-flex text-sm font-medium text-subtle-text hover:text-foreground transition-colors">Log in</Link>
                                <Link to="/auth/register" className="tw-button bg-foreground text-background hover:bg-foreground/90 border-transparent shadow-none">Sign up</Link>
                            </>
                        )
                    )}
                </div>
            </nav>

            {/* Hero Section */}
            <main className="flex-grow flex flex-col relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                {/* Background Blobs */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none z-0">
                    <div className="absolute top-20 left-10 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute top-40 right-10 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px]" />
                </div>

                <div className="container mx-auto px-6 relative z-10 text-center max-w-4xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary border border-border/50 text-xs font-medium text-subtle-text mb-8 animate-fade-in-up">
                        <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                        Universal Verification System v1.0
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/60 leading-[1.1]">
                        The Future of <br className="hidden md:block"/> Verified Credentials.
                    </h1>
                    <p className="text-lg md:text-xl text-subtle-text max-w-2xl mx-auto mb-12 leading-relaxed">
                        Connect applicants with opportunities through a trusted, consent-driven platform.
                        Say goodbye to manual verification and hello to instant trust.
                    </p>

                    {!currentUser && (
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
                            <Link to="/auth/register" className="tw-button h-12 px-8 text-base shadow-xl shadow-primary/20 hover:scale-105 transition-transform hover:shadow-primary/30 w-full sm:w-auto">
                                Get Started
                            </Link>
                            <Link to="/docs" className="tw-button-secondary h-12 px-8 text-base hover:bg-secondary/80 transition-colors w-full sm:w-auto">
                                Documentation
                            </Link>
                        </div>
                    )}

                     {/* Split Selection Section */}
                    {!currentUser && (
                        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto text-left">
                            {/* Applicant Card */}
                            <Link to="/auth/register" className="group relative bg-card hover:bg-secondary/50 border border-border/50 rounded-3xl p-8 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/5">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="relative z-10">
                                    <div className="h-14 w-14 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                        <span className="mso text-3xl filled">person</span>
                                    </div>
                                    <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">For Applicants</h3>
                                    <p className="text-subtle-text mb-6 text-sm leading-relaxed">
                                        Build your verified portfolio. Apply to jobs, programs, and scholarships with a single click.
                                        Control who sees your data.
                                    </p>
                                    <span className="inline-flex items-center text-primary text-sm font-semibold group-hover:gap-2 transition-all">
                                        Create Applicant Account <span className="mso text-sm ml-1 transition-transform group-hover:translate-x-1">arrow_forward</span>
                                    </span>
                                </div>
                            </Link>

                            {/* Institution Card */}
                            <Link to="/auth/register?type=institution" className="group relative bg-card hover:bg-secondary/50 border border-border/50 rounded-3xl p-8 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/5">
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="relative z-10">
                                    <div className="h-14 w-14 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                        <span className="mso text-3xl filled">apartment</span>
                                    </div>
                                    <h3 className="text-2xl font-bold mb-2 group-hover:text-purple-600 transition-colors">For Institutions</h3>
                                    <p className="text-subtle-text mb-6 text-sm leading-relaxed">
                                        Verify documents instantly. Find the best talent with our AI-powered recommendation engine.
                                        Manage applications efficiently.
                                    </p>
                                    <span className="inline-flex items-center text-purple-600 text-sm font-semibold group-hover:gap-2 transition-all">
                                        Create Institution Account <span className="mso text-sm ml-1 transition-transform group-hover:translate-x-1">arrow_forward</span>
                                    </span>
                                </div>
                            </Link>
                        </div>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="py-8 border-t border-border/40 text-center text-subtle-text text-sm bg-background/50 backdrop-blur-sm">
                <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
                     <p>&copy; {new Date().getFullYear()} Badge System. All rights reserved.</p>
                     <div className="flex gap-6">
                         <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
                         <a href="#" className="hover:text-foreground transition-colors">Terms</a>
                         <a href="#" className="hover:text-foreground transition-colors">Contact</a>
                     </div>
                </div>
            </footer>

        </div>
    )
}
