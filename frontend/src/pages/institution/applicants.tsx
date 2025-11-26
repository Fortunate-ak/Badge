import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ApplicationService from "../../../services/application.service";
import type { Application } from "../../../types";

export default function Applicants() {
    const [applications, setApplications] = useState<Application[]>([]);

    useEffect(() => {
        ApplicationService.getAll().then(setApplications);
    }, []);

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Applicants</h1>
            <div className="flex flex-col gap-4">
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
                            <p className="text-sm text-gray-500">
                                Applied for: {application.opportunity.title}
                            </p>
                        </div>
                        <Link
                            to={`/institution/application/${application.id}`}
                            className="tw-button-ghost text-xs"
                        >
                            View Details
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}