import React, { useState, useEffect } from "react";
import useForm from "../../ui/use-form";
import { Link, useNavigate, useSearchParams } from "react-router";
import { RegisterUser } from "../../utils/auth";
import { AuthLayout } from "../../ui/layouts/auth-layout";

export default function Register() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Default to applicant unless type=institution
    const initialType = searchParams.get("type") === "institution" ? "institution" : "applicant";
    const [accountType, setAccountType] = useState<"applicant" | "institution">(initialType);

    const { values, handleChange, setValues } = useForm({
        email: "",
        password: "",
        first_name: "",
        last_name: "",
        bio: "",
        dob: "",
        is_institution_staff: initialType === "institution",
        password_confirm: "",
        interests: ""
    });

    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Update is_institution_staff when accountType changes
    useEffect(() => {
        setValues((prev: any) => ({ ...prev, is_institution_staff: accountType === "institution" }));
    }, [accountType, setValues]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            // Note: register function expects individual args
            await RegisterUser(
                values.email,
                values.password,
                values.first_name,
                values.last_name,
                values.bio || "",
                values.dob,
                values.is_institution_staff,
                values.password_confirm,
                [] // interests
            );
            navigate(accountType === "institution" ? "/institution" : "/applicant/profile");
        } catch (error: any) {
            setError(error.message || "Registration failed");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <AuthLayout
            title="Create an account"
            subtitle="Start your journey with verified credentials."
        >
             {/* Account Type Toggle */}
             <div className="bg-secondary/50 p-1 rounded-lg flex mb-6 relative border border-border/50">
                <button
                    type="button"
                    onClick={() => setAccountType("applicant")}
                    className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${accountType === "applicant" ? "bg-background text-foreground shadow-sm" : "text-subtle-text hover:text-foreground"}`}
                >
                    <span className={`mso text-lg ${accountType === "applicant" ? "filled" : ""}`}>person</span> Applicant
                </button>
                <button
                    type="button"
                    onClick={() => setAccountType("institution")}
                    className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${accountType === "institution" ? "bg-background text-primary shadow-sm" : "text-subtle-text hover:text-foreground"}`}
                >
                    <span className={`mso text-lg ${accountType === "institution" ? "filled" : ""}`}>apartment</span> Institution
                </button>
             </div>


            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                <div className="grid grid-cols-2 gap-4">
                    {/* First Name */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-foreground">First Name</label>
                        <input required name="first_name" type="text" value={values.first_name} onChange={handleChange} className="tw-input w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="Jane" />
                    </div>
                    {/* Last Name */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-foreground">Last Name</label>
                        <input required name="last_name" type="text" value={values.last_name} onChange={handleChange} className="tw-input w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="Doe" />
                    </div>
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-foreground">Email</label>
                    <input required name="email" type="email" value={values.email} onChange={handleChange} className="tw-input w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="jane@example.com" />
                </div>

                {/* DOB */}
                 <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-foreground">Date of Birth</label>
                    <input required name="dob" type="date" value={values.dob} onChange={handleChange} className="tw-input w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                </div>

                {/* Password */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-foreground">Password</label>
                    <input required name="password" type="password" value={values.password} onChange={handleChange} className="tw-input w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="••••••••" />
                </div>

                {/* Confirm Password */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-foreground">Confirm Password</label>
                    <input required name="password_confirm" type="password" value={values.password_confirm} onChange={handleChange} className="tw-input w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="••••••••" />
                </div>

                {/* Submit */}
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="mt-4 w-full bg-primary hover:bg-primary/90 text-white font-medium py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-70 disabled:cursor-not-allowed text-sm"
                >
                    {isLoading ? "Creating account..." : "Get started"}
                </button>

                {/* Error Message */}
                {error && (
                    <div className="mt-2 p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100 flex items-center gap-2">
                        <span className="mso text-lg">error</span>
                        {error}
                    </div>
                )}

                {/* Login Link */}
                <div className="text-center mt-6">
                    <p className="text-sm text-subtle-text">
                        Already have an account? <Link to="/auth" className="font-semibold text-primary hover:text-primary/80 transition-colors">Log in</Link>
                    </p>
                </div>

            </form>
        </AuthLayout>
    );
}
