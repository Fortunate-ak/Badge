import useForm from "../../../ui/use-form";
import type { Opportunity } from "../../../types";

export default function OpportunityForm({
    opportunity,
    onSubmit,
}: {
    opportunity?: Opportunity;
    onSubmit: (opportunity: Partial<Opportunity>) => void;
}) {
    const { values, handleChange, setValues } = useForm<Partial<Opportunity>>(
        opportunity || {
            title: "",
            description: "",
            content: "",
            opportunity_type: "Job",
            tags: [],
        }
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(values);
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
                <label htmlFor="title">Title</label>
                <input
                    type="text"
                    name="title"
                    id="title"
                    value={values.title}
                    onChange={handleChange}
                    className="tw-input"
                />
            </div>
            <div className="flex flex-col gap-2">
                <label htmlFor="description">Description</label>
                <textarea
                    name="description"
                    id="description"
                    value={values.description}
                    onChange={handleChange}
                    className="tw-input"
                />
            </div>
            <div className="flex flex-col gap-2">
                <label htmlFor="content">Content</label>
                <textarea
                    name="content"
                    id="content"
                    value={values.content}
                    onChange={handleChange}
                    className="tw-input"
                />
            </div>
            <div className="flex flex-col gap-2">
                <label htmlFor="opportunity_type">Opportunity Type</label>
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
            <div className="flex flex-col gap-2">
                <label htmlFor="tags">Tags (comma-separated)</label>
                <input
                    type="text"
                    name="tags"
                    id="tags"
                    value={values.tags?.join(", ")}
                    onChange={(e) =>
                        setValues({
                            ...values,
                            tags: e.target.value.split(",").map((t) => t.trim()),
                        })
                    }
                    className="tw-input"
                />
            </div>
            <button type="submit" className="tw-button">
                {opportunity ? "Update" : "Create"} Opportunity
            </button>
        </form>
    );
}