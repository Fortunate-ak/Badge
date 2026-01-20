import { useEffect, useState } from "react";
import {documentService} from "../../../services/document.service";
import type { DocumentCategory } from "../../../types";
import useForm from "../../../ui/use-form";

export default function ConsentRequestModal({
    onSubmit,
    onClose,
}: {
    onSubmit: (categoryIds: string[]) => void;
    onClose: () => void;
}) {
    const [categories, setCategories] = useState<DocumentCategory[]>([]);
    const { values, handleChange, setValues } = useForm<{
        [key: string]: boolean;
    }>({});

    useEffect(() => {
        documentService.getCategories().then(setCategories);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const selectedCategories = Object.keys(values).filter(
            (key) => values[key]
        );
        onSubmit(selectedCategories);
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <h2 className="text-xl font-bold">Request Consent</h2>
            <div className="flex flex-col gap-2">
                {categories.map((category) => (
                    <label key={category.id} className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            name={category.id}
                            checked={values[category.id] || false}
                            onChange={(e) =>
                                setValues({
                                    ...values,
                                    [e.target.name]: e.target.checked,
                                })
                            }
                        />
                        {category.name}
                    </label>
                ))}
            </div>
            <div className="flex gap-2">
                <button type="submit" className="tw-button">
                    Request
                </button>
                <button
                    type="button"
                    className="tw-button-ghost"
                    onClick={onClose}
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}