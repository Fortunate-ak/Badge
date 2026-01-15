import React, { useState } from "react";
import useForm from "../../ui/use-form";
import type { Institution } from "../../types";
import { institutionService } from "../../services/institution.service";
import { useNavigate, useParams } from "react-router";
import { useAuth } from "../../context/AuthContext";


export default function UpdateInstitutionPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const {user} = useAuth();

    if (user?.institution_details?.filter((v) => v.id == id).length == 0) {
        return <h1 className="tw-h1 text-center">You do not have permission to edit this institution.</h1>;
    }
    
    const { values, handleChange, setValues } = useForm<Partial<Institution>>({
        name : "",
        category : "University",
        website : "",
        address : "",
        email : "",
        phone : "",
        description : ""
    });

    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    React.useEffect(() => {
        if (!id) return;
        institutionService.getById(id).then((data) => {
            const { profile_image, ...rest } = data;
            setValues(rest);
            if (profile_image) {
                setImagePreview(profile_image);
            }
        });
    }, [id]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        console.log("Form submitted with values:", values);

        const updateData: Partial<Institution> & { profile_image?: File } = { ...values };
        if (selectedFile) {
            updateData.profile_image = selectedFile;
        }

        institutionService.update(id || "", updateData).then(console.log).finally(() => {
            navigate("/institution");
        });
    }

  return <form onSubmit={handleFormSubmit} className="flex flex-col gap-4 tw-container max-w-2xl mx-auto">
    <h1 className="tw-h1 text-center">Update Institution</h1>

    {/* Profile Image Section */}
    <div className="flex flex-col items-center justify-center mb-6">
        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-100 mb-4 relative bg-gray-50 flex items-center justify-center shadow-sm">
            {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
                <span className="text-gray-300 text-5xl">🏛️</span>
            )}
        </div>
        <label className="cursor-pointer tw-button-secondary text-sm">
            Change Logo
            <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
        </label>
    </div>

    <input className="tw-input" type="text" name="name" value={values.name} onChange={handleChange} placeholder="Name" required />
    <select className="tw-select" name="category" value={values.category} onChange={handleChange} required>
      <option value="University">University</option>
      <option value="Company">Company</option>
      <option value="Vocational School">Vocational School</option>
      <option value="Certification Body">Certification Body</option>
      <option value="Other">Other</option>
    </select>
    <input className="tw-input" type="url" name="website" value={values.website} onChange={handleChange} required placeholder="Website" />
    <input className="tw-input" type="text" name="address" value={values.address} onChange={handleChange} required placeholder="Address" />
    <input className="tw-input" type="email" name="email" value={values.email} onChange={handleChange} required placeholder="Email" />
    <input className="tw-input" type="tel" name="phone" value={values.phone} onChange={handleChange} required placeholder="Phone" />
    <textarea className="tw-input" name="description" value={values.description} onChange={handleChange} required placeholder="Description" rows={4} />
    <button className="tw-button" type="submit">Save Details</button>
  </form>;
}
