import React from 'react';
import { Link } from 'react-router';
import viteLogo from '/vite.svg';

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen w-full bg-background text-foreground font-sans">
      {/* Left Side - Form Area */}
      <div className="flex w-full flex-col justify-center px-6 py-8 md:w-1/2 lg:w-5/12 lg:px-12 xl:px-16 bg-background relative z-10">
        <div className="mx-auto w-full max-w-sm">
            {/* Logo or Brand */}
            <div className="mb-6 flex items-center gap-2">
                <Link to="/" className="flex items-center gap-2 group hover:opacity-80 transition-opacity">
                    <img src={viteLogo} className="h-8 w-8" alt="Badge Logo" />
                    <span className="font-bold text-xl tracking-tight text-foreground">Badge</span>
                </Link>
            </div>

            {/* Header */}
            <div className="mb-6">
                {title && <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>}
                {subtitle && <p className="mt-1 text-sm text-subtle-text">{subtitle}</p>}
            </div>

            {/* Content (Form) */}
            {children}

            {/* Footer */}
            <div className="mt-8 text-center text-xs text-subtle-text opacity-70">
                &copy; {new Date().getFullYear()} Badge. All rights reserved.
            </div>
        </div>
      </div>

      {/* Right Side - Visuals */}
      <div className="hidden md:flex w-1/2 lg:w-7/12 bg-secondary/30 items-center justify-center relative overflow-hidden">
          {/* Subtle Background Gradients */}
          <div className="absolute inset-0 bg-secondary/5">
              <div className="absolute top-0 right-0 h-[600px] w-[600px] bg-primary/5 rounded-full blur-[120px]" />
              <div className="absolute bottom-0 left-0 h-[500px] w-[500px] bg-purple-500/5 rounded-full blur-[100px]" />
          </div>

          {/* Minimalist Card */}
          <div className="relative z-10 p-8 max-w-md text-center">
             <div className="bg-background/40 backdrop-blur-sm border border-border/50 rounded-xl p-8 shadow-sm">
                <div className="mb-4 h-12 w-12 mx-auto rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <span className="mso text-2xl">workspace_premium</span>
                </div>
                <h2 className="text-xl font-semibold mb-2 text-foreground">Universal Verification</h2>
                <p className="text-sm text-subtle-text leading-relaxed">
                    Streamline verification with trust and transparency. Join thousands of institutions and applicants on Badge.
                </p>
             </div>
          </div>
      </div>
    </div>
  );
}
