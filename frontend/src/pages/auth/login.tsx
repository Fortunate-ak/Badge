import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import useForm from "../../ui/use-form"; // Correct default import
import { LoginUser } from "../../utils/auth";
import { AuthLayout } from "../../ui/layouts/auth-layout";

export default function Login() {
    const navigate = useNavigate();
    const { values, handleChange } = useForm({
        email: "",
        password: ""
    });
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            await LoginUser(values.email, values.password);
            // Handle successful login
            navigate("/");
        } catch (error: any) {
             setError(error.message || "An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <AuthLayout
            title="Welcome back"
            subtitle="Please enter your details to sign in."
        >
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-foreground">Email</label>
                    <input
                        required
                        name="email"
                        type="email"
                        value={values.email}
                        onChange={handleChange}
                        className="tw-input w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        placeholder="Enter your email"
                    />
                </div>

                {/* Password */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-foreground">Password</label>
                    <input
                        required
                        name="password"
                        type="password"
                        value={values.password}
                        onChange={handleChange}
                        className="tw-input w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        placeholder="••••••••"
                    />
                </div>

                {/* Remember / Forgot */}
                <div className="flex items-center justify-between mt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-subtle-text select-none group">
                        <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4 transition-colors" />
                        <span className="group-hover:text-foreground transition-colors text-xs font-medium">Remember for 30 days</span>
                    </label>
                    <Link to="#" className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors">
                        Forgot password
                    </Link>
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="mt-4 w-full bg-primary hover:bg-primary/90 text-white font-medium py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-70 disabled:cursor-not-allowed text-sm"
                >
                    {isLoading ? "Signing in..." : "Sign in"}
                </button>

                {/* Error Message */}
                {error && (
                    <div className="mt-2 p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100 flex items-center gap-2">
                        <span className="mso text-lg">error</span>
                        {error}
                    </div>
                )}

                {/* Sign Up Link */}
                <div className="text-center mt-6">
                    <p className="text-sm text-subtle-text">
                        Don't have an account? <Link to="/auth/register" className="font-semibold text-primary hover:text-primary/80 transition-colors">Sign up</Link>
                    </p>
                </div>

            </form>
        </AuthLayout>
    );
}
