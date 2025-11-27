import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import {opportunityService} from "../../services/opportunity.service";
import type { Opportunity } from "../../types";

export default function Opportunities() {
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const navigate = useNavigate()

    useEffect(() => {
        opportunityService.getAll().then(setOpportunities);
    }, []);

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h1 className="tw-h1">Opportunities</h1>
                <button
                    className="tw-button"
                    onClick={() => {
                        navigate("/institution/opportunity/create")
                    }}
                >
                    Create Opportunity
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {opportunities.map((opportunity) => (
                    <Link to={`/institution/opportunity/${opportunity.id}`} key={opportunity.id} className="p-4 border border-border rounded-md bg-secondary group">
                        <div className="flex flex-row justify-between items-center mb-2">
                            <h2 className="text-lg font-bold">{opportunity.title}</h2>
                            <span className="mso group-hover:opacity-100 opacity-0 transition-all -mt-3">arrow_outward</span>
                        </div>
                        
                        <p className="text-sm text-gray-500">
                            {opportunity.opportunity_type}
                        </p>
                        <p className="line-clamp-3">{opportunity.description}</p>
                        
                    </Link>
                ))}
            </div>
        </div>
    );
}