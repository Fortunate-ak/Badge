import { useEffect, useState } from "react";
import { FormElement } from "../../ui/layouts/form";
import useForm from "../../ui/use-form";
import { useAuth } from "../../context/AuthContext";
import { applicantService } from "../../services/applicant.service";
import type { User } from "../../types";
import MultiSelect from "../../ui/multi-select";
import tags from "../../assets/tags.json"
import { useToast } from "../../context/ToastContext";
import { useNavigate } from "react-router";
import { subscribeToPushNotifications } from "../../utils/push-notifications";
import { pushService } from "../../services/push.service";


export default function Profile() {
    const { user } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();

    const { values, handleChange, setValues } = useForm<Partial<User>>({
        first_name: "",
        last_name: "",
        bio: "",
        dob: "",
        interests: []
    });
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [pushEnabled, setPushEnabled] = useState(false);

    useEffect(() => {
        if (user) {
            setValues({
                first_name: user.first_name,
                last_name: user.last_name,
                bio: user.bio,
                dob: user.dob,
                interests: user.interests || []
            });
            if (user.profile_image) {
                setImagePreview(user.profile_image);
            }
        }
    }, [user]);

    useEffect(() => {
        if ('serviceWorker' in navigator) {
             navigator.serviceWorker.ready.then(reg => {
                 reg.pushManager.getSubscription().then(sub => {
                     setPushEnabled(!!sub);
                 });
             });
        }
    }, []);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const togglePush = async () => {
        if (pushEnabled) {
             // For now, no unsubscribe logic implemented as per prompt requirements focus on subscribing
             // But we can just show a message
             toast.info("Push notifications are already enabled.");
             return;
        }

        try {
            const subscription = await subscribeToPushNotifications();
            if (subscription) {
                 await pushService.subscribe(subscription);
                 setPushEnabled(true);
                 toast.success("Push notifications enabled!");
            }
        } catch (e) {
            console.error(e);
            toast.error("Failed to enable push notifications.");
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (!user?.id) return;

            const updateData: Partial<User> & { profile_image?: File } = { ...values };
            if (selectedFile) {
                updateData.profile_image = selectedFile;
            }

            await applicantService.update(user.id, updateData);

            toast.success("Profile updated successfully!");
            navigate('.', { replace: true });
            //window.location.reload();

        } catch (error) {
            console.error(error);
            alert("An error occurred.");
        }
    };

    return (
        <div className="flex flex-col tw-container">
            <h1 className="tw-h1 text-center mb-4">Edit Profile</h1>
            <form onSubmit={handleSubmit} className="bg-background shadow p-6 rounded-md flex flex-col gap-3 w-full max-w-2xl mx-auto">

                {/* Profile Image Section */}
                <div className="flex flex-col items-center justify-center mb-6">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-100 mb-4 relative bg-gray-50 flex items-center justify-center shadow-sm">
                        {imagePreview ? (
                            <img src={imagePreview} alt="Profile Preview" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-gray-300 text-5xl">👤</span>
                        )}
                    </div>
                    <label className="cursor-pointer tw-button-secondary text-sm">
                        Change Photo
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                    </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormElement className="w-full" title="First Name">
                        <input name="first_name" type="text" value={values.first_name || ""} onChange={handleChange} className="tw-input w-full" />
                    </FormElement>
                    <FormElement className="w-full" title="Last Name">
                        <input name="last_name" type="text" value={values.last_name || ""} onChange={handleChange} className="tw-input w-full" />
                    </FormElement>
                    <FormElement className="w-full" title="Date of Birth">
                        <input name="dob" type="date" value={values.dob || ""} onChange={handleChange} className="tw-input w-full" />
                    </FormElement>
                    <FormElement className="w-full md:col-span-2" title="Bio">
                        <textarea name="bio" value={values.bio || ""} onChange={handleChange} className="tw-input w-full" />
                    </FormElement>
                    <FormElement className="w-full md:col-span-2" title="Interests">
                        <MultiSelect onChange={(v) => {setValues({...values, interests:v})}} value={values.interests} placeholder="Type here..." options={tags} />
                    </FormElement>
                </div>

                 <div className="flex justify-between items-center p-4 bg-secondary/30 rounded-md mt-4">
                    <span className="font-semibold">Push Notifications</span>
                    <button type="button" onClick={togglePush} className={"tw-button tw-button-sm " + (pushEnabled ? "bg-green-600 hover:bg-green-700" : "")}>
                        {pushEnabled ? "Enabled" : "Enable"}
                    </button>
                </div>

                <button type="submit" className="tw-button mt-4">Save Changes</button>
            </form>
        </div>
    );
}
