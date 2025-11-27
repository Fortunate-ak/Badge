import { useNavigate } from "react-router";
import { opportunityService } from "../../services/opportunity.service";
import type { Opportunity } from "../../types";
import OpportunityForm from "./components/opportunity-form";
import { useAuth } from "../../context/AuthContext";


export default function CreateOpportunity() {
    const navigate = useNavigate();
    

    const handleCreate = (opportunity: Partial<Opportunity>) => {
        console.log("Creating opportunity:", opportunity);
        opportunityService.create(opportunity).then(() => {
            navigate("/institution");
        }).catch(console.error);
    };

    return <div className="flex flex-col tw-container">
        <h1 className="tw-h1 text-center mb-2">Create Opportunity</h1>
        <OpportunityForm onSubmit={handleCreate} />
    </div>
}