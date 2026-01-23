import { useEffect, useState } from "react";
import {documentService} from "../../../services/document.service";
import type { DocumentCategory } from "../../../types";
import useForm from "../../../ui/use-form";
import { consentService } from "../../../services/consent.service";

export default function ConsentRequestModal({
    onSubmit,
    onClose,
    applicant_id,
    institution_id
}: {
    onSubmit: (categoryIds: string[]) => void;
    onClose: () => void;
    applicant_id:string;
    institution_id:string;
}) {
    const [categories, setCategories] = useState<DocumentCategory[]>([]);
    const { values, handleChange, setValues } = useForm<{
        [key: string]: boolean;
    }>({});

    useEffect(() => {
        documentService.getCategories().then(async (cats) => {
            let consent_cats = await consentService.check([], institution_id, applicant_id);
            console.log(consent_cats, institution_id, applicant_id);
            setCategories(
                cats.filter(val => !consent_cats[val.id])// Only place the categories with a value of False, showing that they haven't been consented
            )
        });
        
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