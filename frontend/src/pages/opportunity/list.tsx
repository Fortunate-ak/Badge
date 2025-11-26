import { useEffect, useState } from "react"
import OpportunityCard from "../../ui/opportunity-card"
import type { Opportunity } from "../../types"
import { opportunityService } from "../../services/opportunity.service";
import { useAuth } from "../../context/AuthContext";

export default function Opportunities() {

    const [ops, setOps] = useState<Opportunity[]>([]);
    const {user, loading} = useAuth();


    useEffect(() => {
        if (user?.is_applicant) {
            opportunityService.getRecommended().then(setOps).catch(console.error);
        }

        if (user?.is_institution_staff) {
            opportunityService.getAll().then(setOps).catch(console.error);
        }
        
    }, [loading, user]);

    return <div>
        <div className="tw-dashboard-grid">
            {ops.map((opportunity, index) => <OpportunityCard key={index} title={opportunity.title} description={opportunity.description} tags={opportunity.tags} company={opportunity.institution_details?.name || ""} logo={opportunity.institution_details?.profile_image}/>)}
        </div>
    </div>
}