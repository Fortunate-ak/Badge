import { useEffect, useState, useMemo } from "react"
import OpportunityCard from "../../ui/opportunity-card"
import type { Opportunity } from "../../types"
import { opportunityService } from "../../services/opportunity.service";
import { useAuth } from "../../context/AuthContext";
import { useSearch } from "../../context/SearchContext";

export default function Opportunities() {

    const [ops, setOps] = useState<Opportunity[]>([]);
    const {user, loading} = useAuth();
    const { setSearchVisible, searchValue } = useSearch();


    useEffect(() => {
        setSearchVisible(true);
        if (user?.is_applicant) {
            opportunityService.getRecommended().then(setOps).catch(console.error);
        }

        if (user?.is_institution_staff) {
            opportunityService.getAll().then(setOps).catch(console.error);
        }
        return () => setSearchVisible(false);
    }, [loading, user]);

    const filteredOps = useMemo(() => {
        if (!searchValue) return ops;
        const lowerSearch = searchValue.toLowerCase();
        return ops.filter(op =>
            op.title.toLowerCase().includes(lowerSearch) ||
            op.description.toLowerCase().includes(lowerSearch) ||
            (op.institution_details?.name || "").toLowerCase().includes(lowerSearch)
        );
    }, [ops, searchValue]);

    return <div>
        <div className="tw-dashboard-grid">
            {filteredOps.map((opportunity, index) => <OpportunityCard id={opportunity.id} key={index} expiry_date={opportunity.expiry_date} title={opportunity.title} description={opportunity.description} tags={opportunity.tags} company={opportunity.institution_details?.name || ""} logo={opportunity.institution_details?.profile_image?.replace("localhost", window.location.host)} match_score={opportunity.match_score}/>)}
        </div>
    </div>
}
