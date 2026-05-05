import { useEffect, useState } from "react";
import { documentService } from "../../../services/document.service";
import type { DocumentCategory, User } from "../../../types";
import useForm from "../../../ui/use-form";
import { consentService } from "../../../services/consent.service";
import { institutionService } from "../../../services/institution.service";
import { useToast } from "../../../context/ToastContext";

export default function ConsentRequestModal({
    onSubmit,
    onClose,
    applicant_id,
    institution_id
}: {
    onSubmit: (categoryIds: string[], applicantId?: string) => void;
    onClose: () => void;
    applicant_id?: string;
    institution_id: string;
}) {
    const toast = useToast();
    const [categories, setCategories] = useState<DocumentCategory[]>([]);
    const [foundUser, setFoundUser] = useState<User | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [email, setEmail] = useState("");
    
    const { values, setValues } = useForm<{
        [key: string]: boolean;
    }>({});

    const activeApplicantId = applicant_id || foundUser?.id;

    useEffect(() => {
        if (activeApplicantId) {
            documentService.getCategories().then(async (cats) => {
                const consent_cats = await consentService.check([], institution_id, activeApplicantId);
                setCategories(
                    cats.filter(val => !consent_cats[val.id])
                );
            });
        } else {
            setCategories([]);
            setValues({});
        }
    }, [activeApplicantId, institution_id]);

    const handleSearchUser = async () => {
        if (!email) return;
        setIsSearching(true);
        try {
            const user = await institutionService.verifyUser(email);
            setFoundUser(user);
            toast.success(`Found user: ${user.first_name} ${user.last_name}`);
        } catch (error) {
            toast.error("User not found with this email.");
            setFoundUser(null);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const selectedCategories = Object.keys(values).filter(
            (key) => values[key]
        );
        if (selectedCategories.length === 0) {
            toast.error("Please select at least one category.");
            return;
        }
        onSubmit(selectedCategories, activeApplicantId);
    };

    return (
        <div className="flex flex-col gap-6 py-2">
            {!applicant_id && (
                <div className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-foreground">Applicant Email</label>
                        <div className="flex gap-2">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="applicant@example.com"
                                className="tw-input flex-1"
                            />
                            <button 
                                type="button" 
                                onClick={handleSearchUser}
                                disabled={isSearching || !email}
                                className="tw-button-secondary px-4 whitespace-nowrap disabled:opacity-50"
                            >
                                {isSearching ? "Searching..." : "Search"}
                            </button>
                        </div>
                    </div>

                    {foundUser && (
                        <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg border border-border">
                            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                {foundUser.first_name[0]}{foundUser.last_name[0]}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold">{foundUser.first_name} {foundUser.last_name}</span>
                                <span className="text-xs text-muted-foreground">{foundUser.email}</span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeApplicantId && (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-3">
                        <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Select Categories to Access:</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {categories.length > 0 ? categories.map((category) => (
                                <label 
                                    key={category.id} 
                                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer hover:border-primary/50 ${values[category.id] ? 'bg-primary/5 border-primary shadow-sm' : 'bg-card border-border'}`}
                                >
                                    <input
                                        type="checkbox"
                                        name={category.id}
                                        checked={values[category.id] || false}
                                        onChange={(e) =>
                                            setValues({
                                                ...values,
                                                [category.id]: e.target.checked,
                                            })
                                        }
                                        className="tw-checkbox"
                                    />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold">{category.name}</span>
                                        {category.description && <span className="text-[10px] text-muted-foreground line-clamp-1">{category.description}</span>}
                                    </div>
                                </label>
                            )) : (
                                <div className="col-span-full py-4 text-center text-sm text-muted-foreground italic">
                                    No additional categories to request for this applicant.
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-border">
                        <button
                            type="button"
                            className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-md transition-colors"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={categories.length === 0}
                            className="tw-button px-6 disabled:opacity-50"
                        >
                            Send Request
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}