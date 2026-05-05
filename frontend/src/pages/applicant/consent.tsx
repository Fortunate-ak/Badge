import { useState, useEffect } from "react";
import type { ConsentLog } from "../../types";
import ConsentCard from "../../ui/consent-card";
import { consentService } from "../../services/consent.service";
import { useToast } from "../../context/ToastContext";

export default function Consent() {
    const [consents, setConsents] = useState<ConsentLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const toast = useToast();

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

    const handleAction = async (consent: ConsentLog) => {
        const action = consent.is_granted ? 'revoke' : 'accept';
        const id = toast.loading(`${action === 'accept' ? 'Granting' : 'Revoking'} access...`);
        
        try {
            if (action === 'accept') {
                await consentService.accept(consent.id);
                toast.update(id, { type: 'success', message: 'Access granted successfully!' });
            } else {
                await consentService.revoke(consent.id);
                toast.update(id, { type: 'success', message: 'Access revoked successfully!' });
            }
            fetchConsents();
        } catch (error) {
            console.error(error);
            toast.update(id, { type: 'error', message: `Failed to ${action} access.` });
        }
    };

    const handleDeny = async (consent: ConsentLog) => {
        const confirmed = await toast.confirm("Are you sure?", {
            description: "You are about to deny this access request. The institution will not be able to view these document categories.",
            confirmText: "Yes, Deny Request"
        });

        if (!confirmed) return;

        const id = toast.loading("Denying request...");
        try {
            await consentService.deny(consent.id);
            toast.update(id, { type: 'success', message: 'Request denied.' });
            fetchConsents();
        } catch (error) {
            console.error(error);
            toast.update(id, { type: 'error', message: 'Failed to deny request.' });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-1">
                <h1 className="tw-h1">Consent Management</h1>
                <p className="text-muted-foreground text-sm">Review and manage access requests from institutions to your documents.</p>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : consents.length > 0 ? (
                <div className="tw-dashboard-grid">
                    {consents.map((content) => (
                        <ConsentCard 
                            key={content.id} 
                            value={content} 
                            onAction={() => handleAction(content)} 
                            onDeny={() => handleDeny(content)}
                        />
                    ))}
                </div>

            ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-muted/20 rounded-xl border-2 border-dashed border-border">
                    <span className="mso text-6xl text-muted-foreground/30 mb-4">order_approve</span>
                    <h3 className="text-xl font-semibold text-foreground">No Consent Requests</h3>
                    <p className="text-muted-foreground text-center max-w-md mt-2">
                        When institutions request access to your documents, they will appear here for your approval.
                    </p>
                </div>
            )}
        </div>
    );
}