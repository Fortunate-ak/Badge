import { useNavigate } from "react-router";
import { opportunityService } from "../../services/opportunity.service";
import type { Opportunity } from "../../types";
import OpportunityForm from "./components/opportunity-form";


import { useToast } from "../../context/ToastContext";

export default function CreateOpportunity() {
    const navigate = useNavigate();
    const toast = useToast();

    const handleCreate = (opportunity: Partial<Opportunity>) => {
        const loadingId = toast.loading("Creating opportunity...");
        opportunityService.create(opportunity).then(() => {
            toast.update(loadingId, { type: "success", message: "Opportunity created successfully!" });
            navigate("/institution");
        }).catch((err) => {
            console.error(err);
            // Handle validation errors from backend
            let errorMsg = "Failed to create opportunity. Please check your inputs.";
            if (err && typeof err === 'object') {
                const msgs = Object.entries(err).map(([key, val]) => `${key}: ${val}`);
                if (msgs.length > 0) errorMsg = msgs.join('\n');
            }
            toast.update(loadingId, { type: "error", message: errorMsg });
        });
    };

    return <div className="flex flex-col tw-container">
        <h1 className="tw-h1 text-center mb-2">Create Opportunity</h1>
        <OpportunityForm onSubmit={handleCreate} />
    </div>
}