import React from "react";
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

    React.useEffect(() => {
        if (!id) return;
        institutionService.getById(id).then((data) => {
            setValues(data);
        });
    }, [id]);

    const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        console.log("Form submitted with values:", values);
        institutionService.update(id || "", values).then(console.log).finally(() => {
            navigate("/institution");
        });
    }

  return <form onSubmit={handleFormSubmit} className="flex flex-col gap-4 tw-container">
    <h1 className="tw-h1 text-center">Update Institution</h1>
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