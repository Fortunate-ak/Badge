import React from "react";
import useForm from "../../ui/use-form";
import type { Institution } from "../../types";
import { institutionService } from "../../services/institution.service";
import { useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";


export default function CreateInstitutionPage() {
    const navigate = useNavigate();
    
    const { values, handleChange } = useForm<Partial<Institution>>({
        name : "",
        category : "University",
        website : "",
        address : "",
        email : "",
        phone : "",
        description : ""
    });

    const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        console.log("Form submitted with values:", values);
        institutionService.create(values).then(console.log).finally(() => {
            navigate("/institution");
        });
    }

  return <form onSubmit={handleFormSubmit} className="flex flex-col gap-4 tw-container">
    <h1 className="tw-h1 text-center">Create Institution</h1>
    <input className="tw-input" type="text" name="name" value={values.name} onChange={handleChange} placeholder="Name" required />
    <select className="tw-select" name="category" value={values.category} onChange={handleChange} required>
      <option value="University">University</option>
      <option value="Company">Company</option>
      <option value="Vocational School">Vocational School</option>
      <option value="Certification Body">Certification Body</option>
      <option value="Other">Other</option>
    </select>
    <input className="tw-input" type="url" name="website" value={values.website} onChange={handleChange} placeholder="Website" />
    <input className="tw-input" type="text" name="address" value={values.address} onChange={handleChange} placeholder="Address" />
    <input className="tw-input" type="email" name="email" value={values.email} onChange={handleChange} placeholder="Email" />
    <input className="tw-input" type="tel" name="phone" value={values.phone} onChange={handleChange} placeholder="Phone" />
    <textarea className="tw-textarea" name="description" value={values.description} onChange={handleChange} placeholder="Description" rows={4} />
    <button className="tw-button" type="submit">Create Institution</button>
  </form>;
}