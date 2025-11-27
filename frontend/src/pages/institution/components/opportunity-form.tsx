import useForm from "../../../ui/use-form";
import type { Opportunity } from "../../../types";
import { useAuth } from "../../../context/AuthContext";

export default function OpportunityForm({
    opportunity,
    onSubmit,
}: {
    opportunity?: Opportunity;
    onSubmit: (opportunity: Partial<Opportunity>) => void;
}) {
    const { user } = useAuth();
    const { values, handleChange, setValues } = useForm<Partial<Opportunity>>(
        opportunity || {
            title: "",
            description: "",
            content: "",
            opportunity_type: "Job",
            tags: [],
            positive_tags: [],
            negative_tags: [],
            start_date: "",
            expiry_date: "",
            posted_by_institution : user?.institution_details?.[0]?.id,
        }
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(values);
        console.log(values);
    };

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

            <input
                type="text"
                name="positive_tags"
                id="positive_tags"
                value={values.positive_tags?.join(", ")}
                onChange={(e) =>
                    setValues({
                        ...values,
                        positive_tags: e.target.value.split(",").map((t) => t.trim()),
                    })
                }
                className="tw-input"
                placeholder="Positive Tags (comma separated)"
            />

            <input
                type="text"
                name="negative_tags"
                id="negative_tags"
                value={values.negative_tags?.join(", ")}
                onChange={(e) =>
                    setValues({
                        ...values,
                        negative_tags: e.target.value.split(",").map((t) => t.trim()),
                    })
                }
                className="tw-input"
                placeholder="Negative Tags (comma separated)"
            />


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

            <button type="submit" className="tw-button">
                {opportunity ? "Update" : "Create"} Opportunity
            </button>
        </form>
    );
}