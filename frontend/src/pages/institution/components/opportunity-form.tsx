import useForm from "../../../ui/use-form";
import type { DocumentCategory, Opportunity, SpecificRequirement } from "../../../types";
import { useAuth } from "../../../context/AuthContext";
import tags from "../../../assets/tags.json"
import MultiSelect from "../../../ui/multi-select";
import { useEffect, useState } from "react";
import { documentService } from "../../../services/document.service";

export default function OpportunityForm({
    opportunity,
    onSubmit,
}: {
    opportunity?: Opportunity;
    onSubmit: (opportunity: Partial<Opportunity>) => void;
}) {
    const { user } = useAuth();
    const [categories, setCategories] = useState<DocumentCategory[]>([]);
    const { values, handleChange, setValues } = useForm<Partial<Opportunity>>(
        opportunity || {
            title: "",
            description: "",
            content: "",
            opportunity_type: "Job",
            tags: [],
            start_date: "",
            expiry_date: "",
            posted_by_institution: user?.institution_details?.[0]?.id,
            document_categories: [],
            specific_requirements: []
        }
    );

    useEffect(() => {
        documentService.getCategories().then((fetchedCategories) => {
            setCategories(fetchedCategories);
        }).catch((err) => {
            console.error("Error fetching categories:", err);
        });
    }, [])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(values);
        console.log(values);
    };

    const addRequirement = () => {
        const newReq: SpecificRequirement = { id: Date.now().toString(), label: "", mandatory: false };
        setValues({ ...values, specific_requirements: [...(values.specific_requirements || []), newReq] });
    }

    const removeRequirement = (index: number) => {
        const reqs = [...(values.specific_requirements || [])];
        reqs.splice(index, 1);
        setValues({ ...values, specific_requirements: reqs });
    }

    const updateRequirement = (index: number, field: keyof SpecificRequirement, value: any) => {
        const reqs = [...(values.specific_requirements || [])];
        reqs[index] = { ...reqs[index], [field]: value };
        setValues({ ...values, specific_requirements: reqs });
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="md:grid md:grid-cols-2 flex flex-col gap-4">
                <input
                    type="text"
                    name="title"
                    id="title"
                    value={values.title}
                    onChange={handleChange}
                    className="tw-input"
                    placeholder="Title"
                />

                <select
                    name="opportunity_type"
                    id="opportunity_type"
                    value={values.opportunity_type}
                    onChange={handleChange}
                    className="tw-input"
                >
                    <option value="Job">Job</option>
                    <option value="Program">Program</option>
                    <option value="Scholarship">Scholarship</option>
                    <option value="Admission">Admission</option>
                </select>
            </div>

            <textarea
                name="description"
                id="description"
                value={values.description}
                onChange={handleChange}
                className="tw-input"
                placeholder="Short Description"
            />

            <textarea
                name="content"
                id="content"
                value={values.content}
                onChange={handleChange}
                className="tw-input"
                placeholder="Content"
            />

            <MultiSelect onChange={(v) => { setValues({ ...values, tags: v }) }} value={values.tags} placeholder="Tags" options={tags} />

            <div className="md:grid md:grid-cols-2 flex flex-col gap-4">
                <input type="date" onChange={handleChange} name="start_date" placeholder="Start Date" className="tw-input" required />
                <input type="date" onChange={handleChange} name="expiry_date" placeholder="Expiry Date" className="tw-input" required />
            </div>

            <select
                name="posted_by_institution"
                id="posted_by_institution"
                value={values.posted_by_institution}
                onChange={handleChange}
                className="tw-input"
            >
                <option value="">Select Institution</option>
                {
                    user?.institution_details?.map((inst) => (
                        <option key={inst.id} value={inst.id}>{inst.name}</option>
                    ))
                }
            </select>


            <select name="document_categories" multiple required onChange={(e) => {
                const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
                setValues({ ...values, document_categories: selectedOptions });
            }} className="tw-input">
                <option disabled value="">Select Documents Categories</option>
                {
                    categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))
                }
            </select>

            <div className="flex flex-col gap-2 p-4 border border-border rounded-md">
                <div className="flex justify-between items-center">
                    <h3 className="font-semibold">Specific Document Requirements</h3>
                    <button type="button" onClick={addRequirement} className="tw-button-secondary text-xs">
                        + Add Requirement
                    </button>
                </div>

                {values.specific_requirements?.length === 0 && (
                    <p className="text-sm text-muted italic">No specific requirements added.</p>
                )}

                <div className="flex flex-col gap-2">
                    {values.specific_requirements?.map((req, index) => (
                        <div key={req.id} className="flex flex-row gap-2 items-center">
                            <input
                                type="text"
                                className="tw-input flex-1 py-1"
                                placeholder="e.g. AWS Certified Solutions Architect"
                                value={req.label}
                                onChange={(e) => updateRequirement(index, 'label', e.target.value)}
                                required
                            />
                            <label className="flex items-center gap-1 text-sm whitespace-nowrap">
                                <input
                                    type="checkbox"
                                    checked={req.mandatory}
                                    onChange={(e) => updateRequirement(index, 'mandatory', e.target.checked)}
                                    className="tw-checkbox"
                                />
                                Mandatory
                            </label>
                            <button
                                type="button"
                                onClick={() => removeRequirement(index)}
                                className="tw-button-ghost text-red-500 hover:text-red-700"
                            >
                                <span className="mso">delete</span>
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <button type="submit" className="tw-button cursor-pointer">
                {opportunity ? "Update" : "Create"} Opportunity
            </button>
        </form>
    );
}