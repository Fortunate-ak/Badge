import { useEffect, useState } from "react";
import { Link } from "react-router";
import {applicationService} from "../../services/application.service";
import { institutionService } from "../../services/institution.service";
import type { Application, InstitutionStaff } from "../../types";

export default function Staff() {
    const [staff, setStaff] = useState<InstitutionStaff[]>([]);

    useEffect(() => {
        institutionService.getStaff().then(setStaff);
    }, []);

    return (
        <div>
            <h1 className="tw-h1 mb-2">Applicants</h1>
            <div className="flex flex-col gap-4">
                {staff.map((member) => (
                    <div
                        key={member.id}
                        className="p-4 border border-border rounded-md flex justify-between items-center"
                    >
                        <div>
                            <p className="font-bold">
                                {member.user_details?.first_name}{" "}
                                {member.user_details?.last_name}
                            </p>
                            
                        </div>
                        <Link
                            to={`/institution`}
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