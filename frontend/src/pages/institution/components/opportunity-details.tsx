import { useEffect, useState } from "react";
import {opportunityService} from "../../../services/opportunity.service";
import {applicationService} from "../../../services/application.service";
import type { Opportunity, Application } from "../../../types";
import { useParams, Link } from "react-router";

export default function OpportunityDetails() {
    const { id } = useParams<{ id: string }>();
    const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
    const [applications, setApplications] = useState<Application[]>([]);

    useEffect(() => {
        if (id) {
            opportunityService.getById(id).then(setOpportunity);
            applicationService.getAll(id).then(setApplications);
        }
    }, [id]);

    if (!opportunity) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1 className="text-2xl font-bold">{opportunity.title}</h1>
            <p className="text-sm text-gray-500">
                {opportunity.opportunity_type}
            </p>
            <p>{opportunity.description}</p>
            <div className="mt-8">
                <h2 className="text-xl font-bold">Applicants</h2>
                <div className="flex flex-col gap-4 mt-4">
                    {applications.map((application) => (
                        <div
                            key={application.id}
                            className="p-4 border rounded-md flex justify-between items-center"
                        >
                            <div>
                                <p className="font-bold">
                                    {application.applicant.first_name}{" "}
                                    {application.applicant.last_name}
                                </p>
                            </div>
                            <Link
                                to={`/institution/application/${application.id}`}
                                className="tw-button-ghost text-xs"
                            >
                                View Application
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}