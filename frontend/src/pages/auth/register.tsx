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
        setValues(prev => ({ ...prev, is_institution_staff: accountType === "institution" }));
    }, [accountType, setValues]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            const interestsList = values.interests ? values.interests.split(',').map((i: string) => i.trim()) : [];
            await RegisterUser(
                values.email,
                values.password,
                values.first_name,
                values.last_name,
                values.bio,
                values.dob,
                values.is_institution_staff,
                values.password_confirm,
                interestsList
            );
            // Handle successful login (e.g., redirect or show a success message)
            navigate(accountType === "institution" ? "/institution" : "/applicant/profile"); // go straight to profile
        } catch (error) {
            setError((error as Error).message);
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
             <div className="bg-secondary p-1 rounded-xl flex mb-8 relative border border-border/50">
                <button
                    type="button"
                    onClick={() => setAccountType("applicant")}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${accountType === "applicant" ? "bg-background text-foreground shadow-sm" : "text-subtle-text hover:text-foreground"}`}
                >
                    <span className={`mso ${accountType === "applicant" ? "filled" : ""}`}>person</span> Applicant
                </button>
                <button
                    type="button"
                    onClick={() => setAccountType("institution")}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${accountType === "institution" ? "bg-background text-primary shadow-sm" : "text-subtle-text hover:text-foreground"}`}
                >
                    <span className={`mso ${accountType === "institution" ? "filled" : ""}`}>apartment</span> Institution
                </button>
             </div>


            <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                <div className="grid grid-cols-2 gap-4">
                    {/* First Name */}
                    <div>
                        <label className="tw-label">First Name</label>
                        <input required name="first_name" type="text" value={values.first_name} onChange={handleChange} className="tw-input" placeholder="Jane" />
                    </div>
                    {/* Last Name */}
                    <div>
                        <label className="tw-label">Last Name</label>
                        <input required name="last_name" type="text" value={values.last_name} onChange={handleChange} className="tw-input" placeholder="Doe" />
                    </div>
                </div>

                {/* Email */}
                <div>
                    <label className="tw-label">Email</label>
                    <input required name="email" type="email" value={values.email} onChange={handleChange} className="tw-input" placeholder="jane@example.com" />
                </div>

                {/* DOB */}
                 <div>
                    <label className="tw-label">Date of Birth</label>
                    <input required name="dob" type="date" value={values.dob} onChange={handleChange} className="tw-input" />
                </div>

                {/* Password */}
                <div>
                    <label className="tw-label">Password</label>
                    <input required name="password" type="password" value={values.password} onChange={handleChange} className="tw-input" placeholder="••••••••" />
                </div>

                {/* Confirm Password */}
                <div>
                    <label className="tw-label">Confirm Password</label>
                    <input required name="password_confirm" type="password" value={values.password_confirm} onChange={handleChange} className="tw-input" placeholder="••••••••" />
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="tw-button w-full mt-2 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isLoading ? "Creating account..." : "Get started"}
                </button>

                 {/* Google Sign In (Mock) */}
                 <button type="button" className="tw-button-secondary w-full gap-2 bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm">
                     <span className="h-5 w-5 flex items-center justify-center font-bold text-lg text-blue-500">G</span>
                    Sign up with Google
                </button>


                {/* Error Message */}
                {error && (
                    <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100 flex items-center gap-2 animate-pulse">
                        <span className="mso text-lg">error</span>
                        {error}
                    </div>
                )}

                {/* Login Link */}
                <p className="text-center text-sm text-subtle-text mt-4">
                    Already have an account? <Link to="/auth" className="font-semibold text-primary hover:text-primary/80 transition-colors">Log in</Link>
                </p>

            </form>
        </AuthLayout>
    );
}
