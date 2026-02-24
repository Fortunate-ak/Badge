import React from 'react';
import { Link } from 'react-router';

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen w-full bg-background text-foreground font-sans">
      {/* Left Side - Form Area */}
      <div className="flex w-full flex-col justify-center px-8 py-12 md:w-1/2 lg:w-5/12 lg:px-16 xl:px-24 bg-background relative z-10">
        <div className="mx-auto w-full max-w-sm lg:max-w-md">
            {/* Logo or Brand */}
            <div className="mb-10 flex items-center gap-2">
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg shadow-primary/20">
                        <span className="mso text-white text-xl">verified_user</span>
                    </div>
                    <span className="font-bold text-xl tracking-tight">Badge</span>
                </Link>
            </div>

            {/* Header */}
            <div className="mb-8">
                {title && <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>}
                {subtitle && <p className="mt-2 text-sm text-subtle-text">{subtitle}</p>}
            </div>

            {/* Content (Form) */}
            {children}

            {/* Footer */}
            <div className="mt-10 text-center text-xs text-subtle-text">
                &copy; {new Date().getFullYear()} Badge. All rights reserved.
            </div>
        </div>
      </div>

      {/* Right Side - Visuals */}
      <div className="hidden md:flex w-1/2 lg:w-7/12 bg-secondary items-center justify-center relative overflow-hidden">
          {/* Abstract Background */}
          <div className="absolute inset-0 bg-secondary">
              <div className="absolute -top-[20%] -left-[10%] h-[500px] w-[500px] rounded-full bg-primary/20 blur-[100px]" />
              <div className="absolute top-[40%] right-[10%] h-[400px] w-[400px] rounded-full bg-purple-500/20 blur-[100px]" />
              <div className="absolute -bottom-[10%] -left-[10%] h-[600px] w-[600px] rounded-full bg-blue-500/10 blur-[120px]" />
          </div>

          {/* Foreground Element (Glass Card or Illustration) */}
          <div className="relative z-10 p-12 max-w-lg text-center">
             <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl transition-transform hover:scale-[1.02] duration-500">
                <div className="mb-6 h-16 w-16 mx-auto rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/30">
                    <span className="mso text-white text-3xl">workspace_premium</span>
                </div>
                <h2 className="text-2xl font-bold mb-4 text-foreground">Universal Verification</h2>
                <p className="text-subtle-text leading-relaxed">
                    Join thousands of institutions and applicants using Badge to streamline the verification process with trust and transparency.
                </p>
             </div>
          </div>
      </div>
    </div>
  );
}
