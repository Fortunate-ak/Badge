import { useState, useEffect, useRef } from "react";
import { consentService } from "../../services/consent.service";
import type { ConsentLog } from "../../types";
import { DataTable, type Column } from "../../ui/data-table";
import { useToast } from "../../context/ToastContext";
import MinimalModal, { type ModalHandle } from "../../ui/layouts/modal";
import ConsentRequestModal from "./components/consent-request-modal";
import { useAuth } from "../../context/AuthContext";

export default function InstitutionConsent() {
    const { user } = useAuth();
    const [consents, setConsents] = useState<ConsentLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const toast = useToast();
    const requestModalRef = useRef<ModalHandle>(null);

    const institutionId = user?.institution_details?.[0]?.id;

    const fetchConsents = async () => {
        setIsLoading(true);
        try {
            const data = await consentService.getAll();
            setConsents(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch consents");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchConsents();
    }, []);

    const handleConsentRequest = async (categoryIds: string[], applicantId: string) => {
        if (!institutionId) return;
        try {
            await consentService.create({
                applicant: applicantId,
                document_categories: categoryIds,
                requester_institution: institutionId
            });
            toast.success("Consent request sent successfully.");
            requestModalRef.current?.close();
            fetchConsents();
        } catch (error) {
            toast.error("Failed to send consent request.");
        }
    };

    const columns: Column<ConsentLog>[] = [
        {
            key: "created_at",
            header: "Date",
            cell: (_, row) => new Date(row.created_at).toLocaleDateString(),
        },
        {
            key: "applicant",
            header: "Applicant",
            cell: (_, row) => (
                <div className="flex items-center gap-2">
                    {row.applicant_details?.profile_image ? (
                        <img src={row.applicant_details.profile_image} className="size-6 rounded-full" />
                    ) : (
                        <span className="mso text-lg">person</span>
                    )}
                    <span>{row.applicant_details?.first_name} {row.applicant_details?.last_name}</span>
                </div>
            )
        },
        {
            key: "categories",
            header: "Requested Categories",
            cell: (_, row) => (
                <div className="flex flex-wrap gap-1">
                    {row.document_categories_details?.map(cat => (
                        <span key={cat.id} className="text-[10px] bg-secondary px-1.5 py-0.5 rounded border border-border">
                            {cat.name}
                        </span>
                    ))}
                </div>
            )
        },
        {
            key: "status",
            header: "Status",
            cell: (_, row) => (
                <div className="flex items-center gap-1.5">
                    <span className={`size-2 rounded-full ${row.is_granted ? 'bg-green-500' : row.revoked_at ? 'bg-red-500' : 'bg-amber-500'}`}></span>
                    <span className="text-xs font-medium">
                        {row.is_granted ? 'Granted' : row.revoked_at ? 'Revoked' : 'Pending'}
                    </span>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-row justify-between items-start">
                <div className="flex flex-col gap-1">
                    <h1 className="tw-h1">Consent Management</h1>
                    <p className="text-muted-foreground text-sm">Monitor and manage access requests sent to applicants.</p>
                </div>
                <button 
                    onClick={() => requestModalRef.current?.open()}
                    className="tw-button flex items-center gap-2"
                >
                    <span className="mso text-sm">add</span>
                    Request Consent
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : (
                <div className="bg-card border border-border rounded-lg overflow-hidden">
                    <DataTable 
                        columns={columns} 
                        data={consents} 
                        rowKey="id"
                    />
                    {consents.length === 0 && (
                        <div className="py-12 text-center text-muted-foreground">
                            No consent requests found.
                        </div>
                    )}
                </div>
            )}

            <MinimalModal ref={requestModalRef} title="New Consent Request">
                <ConsentRequestModal 
                    onSubmit={(categoryIds, applicantId) => handleConsentRequest(categoryIds, applicantId || "")}
                    institution_id={institutionId || ""}
                    onClose={() => requestModalRef.current?.close()}
                />
            </MinimalModal>
        </div>
    );
}
