import React, { useEffect } from "react";
import { FormElement } from "../../ui/layouts/form";
import useForm from "../../ui/use-form";
import { Link, useNavigate } from "react-router";
import { LoginUser } from "../../utils/auth";

export default function Login() {
    const navigate = useNavigate();
    const { values, handleChange, setValues } = useForm({
        email: "",
        password: ""
    });
    const [error, setError] = React.useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await LoginUser(values.email, values.password);
            // Handle successful login (e.g., redirect or show a success message)
            // navigate("/");
        } catch (error) {
            setError((error as Error).message);
        }
        
    }

    return <main className="bg-secondary flex flex-row items-center justify-center w-full h-full px-8 md:px-1">
        <form onSubmit={handleSubmit} title="" className="bg-background shadow p-6 rounded-md flex flex-col gap-3 lg:w-1/4 md:w-1/3 w-full">
            <h1 className="text-xl font-semibold text-center">Welcome Back!</h1>
            <FormElement className="w-full" title="Email">
                <input required name="email" type="email" value={values.email} onChange={handleChange} className="tw-input w-full" placeholder="example@gmail.com" />
            </FormElement>
            <FormElement className="w-full" title="Password">
                <input required name="password" type="password" value={values.password} onChange={handleChange} className="tw-input w-full" placeholder="Password" />
            </FormElement>

            <button type="submit" className="tw-button cursor-pointer">
                Login
            </button>

            <p className="text-red-500 text-center w-full">
                {error}
            </p>

            <p className="text-sm text-center">
                Don't have an account? <Link to="/auth/register" className="text-primary font-semibold underline underline-offset-1">Register</Link>
            </p>

        </form>
    </main>
}