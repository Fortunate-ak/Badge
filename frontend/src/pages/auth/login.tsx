import React, { useState } from "react";
import useForm from "../../ui/use-form";
import { Link, useNavigate } from "react-router";
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
            // Handle successful login (e.g., redirect or show a success message)
            navigate("/");
        } catch (error) {
            setError((error as Error).message);
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
                <div>
                    <label className="tw-label">Email</label>
                    <input
                        required
                        name="email"
                        type="email"
                        value={values.email}
                        onChange={handleChange}
                        className="tw-input"
                        placeholder="Enter your email"
                    />
                </div>

                {/* Password */}
                <div>
                    <label className="tw-label">Password</label>
                    <input
                        required
                        name="password"
                        type="password"
                        value={values.password}
                        onChange={handleChange}
                        className="tw-input"
                        placeholder="••••••••"
                    />
                </div>

                {/* Remember / Forgot */}
                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-subtle-text select-none group">
                        <input type="checkbox" className="tw-checkbox" />
                        <span className="group-hover:text-foreground transition-colors">Remember for 30 days</span>
                    </label>
                    <Link to="#" className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
                        Forgot password
                    </Link>
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="tw-button w-full shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isLoading ? <span className="animate-pulse">Signing in...</span> : "Sign in"}
                </button>

                {/* Google Sign In (Mock) */}
                <button type="button" className="tw-button-secondary w-full gap-2 bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm">
                     <span className="h-5 w-5 flex items-center justify-center font-bold text-lg text-blue-500">G</span>
                    Sign in with Google
                </button>

                {/* Error Message */}
                {error && (
                    <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100 flex items-center gap-2 animate-pulse">
                        <span className="mso text-lg">error</span>
                        {error}
                    </div>
                )}

                {/* Sign Up Link */}
                <p className="text-center text-sm text-subtle-text mt-4">
                    Don't have an account? <Link to="/auth/register" className="font-semibold text-primary hover:text-primary/80 transition-colors">Sign up</Link>
                </p>

            </form>
        </AuthLayout>
    );
}
