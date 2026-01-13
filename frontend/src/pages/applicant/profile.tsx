import { useEffect } from "react";
import { FormElement } from "../../ui/layouts/form";
import useForm from "../../ui/use-form";
import { useAuth } from "../../context/AuthContext";
import { customFetch } from "../../utils";
import type { User } from "../../types";

export default function Profile() {
    const { user } = useAuth();
    const { values, handleChange, setValues } = useForm<Partial<User>>({
        first_name: "",
        last_name: "",
        bio: "",
        dob: "",
        interests: []
    });

    useEffect(() => {
        if (user) {
            setValues({
                first_name: user.first_name,
                last_name: user.last_name,
                bio: user.bio,
                dob: user.dob,
                interests: user.interests || []
            });
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Ensure interests is an array if edited as string (though here we handle it as string input converted to array)
            // But useForm values are derived from User type which has interests: string[]
            // We need to handle the input change for interests carefully.

            // Note: Since UserViewSet inherits ModelViewSet, and we can access it via ID.
            // However, typically users update their own profile.
            // I'll check if there is a specific endpoint or if I should use /api/users/{id}/

            if (!user?.id) return;

            const res = await customFetch(`/api/users/${user.id}/`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values)
            });

            if (res.ok) {
                alert("Profile updated successfully!");
                window.location.reload(); // Simple reload to refresh context
            } else {
                alert("Failed to update profile.");
            }

        } catch (error) {
            console.error(error);
            alert("An error occurred.");
        }
    };

    return (
        <div className="flex flex-col tw-container">
            <h1 className="tw-h1 text-center mb-4">Edit Profile</h1>
            <form onSubmit={handleSubmit} className="bg-background shadow p-6 rounded-md flex flex-col gap-3 w-full max-w-2xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormElement className="w-full" title="First Name">
                        <input name="first_name" type="text" value={values.first_name} onChange={handleChange} className="tw-input w-full" />
                    </FormElement>
                    <FormElement className="w-full" title="Last Name">
                        <input name="last_name" type="text" value={values.last_name} onChange={handleChange} className="tw-input w-full" />
                    </FormElement>
                    <FormElement className="w-full" title="Date of Birth">
                        <input name="dob" type="date" value={values.dob} onChange={handleChange} className="tw-input w-full" />
                    </FormElement>
                    <FormElement className="w-full md:col-span-2" title="Bio">
                        <textarea name="bio" value={values.bio} onChange={handleChange} className="tw-input w-full" />
                    </FormElement>
                    <FormElement className="w-full md:col-span-2" title="Interests (comma separated)">
                        <input
                            name="interests"
                            type="text"
                            value={Array.isArray(values.interests) ? values.interests.join(", ") : values.interests}
                            onChange={(e) => setValues({...values, interests: e.target.value.split(",").map(s => s.trim())})}
                            className="tw-input w-full"
                        />
                    </FormElement>
                </div>
                <button type="submit" className="tw-button mt-4">Save Changes</button>
            </form>
        </div>
    );
}
