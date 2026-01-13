import React from "react";
import { FormElement } from "../../ui/layouts/form";
import useForm from "../../ui/use-form";
import { Link, useNavigate } from "react-router";
import { RegisterUser } from "../../utils/auth";

export default function Register() {
    const navigate = useNavigate();
    const { values, handleChange, setValues } = useForm({
        email: "",
        password: "",
        first_name: "",
        last_name: "",
        bio: "",
        dob: "",
        is_institution_staff: false,
        password_confirm: "",
        interests: ""
    });
    const [error, setError] = React.useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log(values);
        try {
            const interestsList = values.interests ? values.interests.split(',').map((i: string) => i.trim()) : [];
            await RegisterUser(values.email, values.password, values.first_name, values.last_name, values.bio, values.dob, values.is_institution_staff, values.password_confirm, interestsList);
            // Handle successful login (e.g., redirect or show a success message)
            navigate("/");
        } catch (error) {
            setError((error as Error).message);
        }

    }

    return <main className="bg-secondary flex flex-row items-center justify-center w-full h-full px-8 md:px-1">
        <form onSubmit={handleSubmit} className="bg-background shadow p-6 rounded-md flex flex-col gap-3 lg:w-1/3 md:w-1/2 w-full">
            <h1 className="text-xl font-semibold text-center">Join the community!</h1>

            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormElement className="w-full" title="Email">
                    <input required name="email" type="email" value={values.email} onChange={handleChange} className="tw-input w-full" placeholder="example@gmail.com" />
                </FormElement>
                <FormElement className="w-full" title="Password">
                    <input required name="password" type="password" value={values.password} onChange={handleChange} className="tw-input w-full" placeholder="Password" />
                </FormElement>
                <FormElement className="w-full" title="Confirm Password">
                    <input required name="password_confirm" type="password" value={values.password_confirm} onChange={handleChange} className="tw-input w-full" placeholder="Confirm Password" />
                </FormElement>
                <FormElement className="w-full" title="Date of Birth">
                    <input required name="dob" type="date" value={values.dob} onChange={handleChange} className="tw-input w-full" placeholder="Date of Birth" />
                </FormElement>
                <FormElement className="w-full" title="First Name">
                    <input required name="first_name" type="text" value={values.first_name} onChange={handleChange} className="tw-input w-full" placeholder="First Name" />
                </FormElement>
                <FormElement className="w-full" title="Last Name">
                    <input required name="last_name" type="text" value={values.last_name} onChange={handleChange} className="tw-input w-full" placeholder="Last Name" />
                </FormElement>
                <FormElement className="w-full md:col-span-2" title="Bio">
                    <textarea required name="bio" value={values.bio} onChange={handleChange} className="tw-input w-full" placeholder="Short Bio" />
                </FormElement>
                <FormElement className="w-full md:col-span-2" title="Interests">
                    <input name="interests" type="text" value={values.interests} onChange={handleChange} className="tw-input w-full" placeholder="Interests (comma separated)" />
                </FormElement>

            </div>

            <button type="submit" className="tw-button cursor-pointer">
                Register
            </button>

            <p className="text-red-500 text-center w-full">
                {error}
            </p>

            <p className="text-sm text-center">
                Already have an account? <Link to="/auth/" className="text-primary font-semibold underline underline-offset-1">Login</Link>
            </p>

        </form>
    </main>
}