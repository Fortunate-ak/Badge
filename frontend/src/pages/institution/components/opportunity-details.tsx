import { useEffect, useState, useRef } from "react";
import { opportunityService } from "../../../services/opportunity.service";
import { DataTable, type Column, type DataTableHandle } from "../../../ui/data-table";
import type { Opportunity, Application } from "../../../types";
import { useParams, Link } from "react-router";

export default function OpportunityDetails() {
    const { id } = useParams<{ id: string }>();
    const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
    const [applications, setApplications] = useState<Application[]>([]);

    useEffect(() => {
        if (id) {
            opportunityService.getById(id).then(setOpportunity);
            opportunityService.getApplications(id).then(setApplications);
        }
    }, [id]);

    const tableRef = useRef<DataTableHandle<Application> | null>(null);

    const columns: Column<Application>[] = [
        { key: "fullname", header: "FullName", accessor: (row) => row.applicant.first_name + " " + row.applicant.last_name },
        {key:"email", header : "Email", accessor: (row) => row.applicant.email },
        { key: "dob", header: "DOB", accessor: (row) => row.applicant.dob },
        {
            key: "created_at",
            header: "Created Date",
            accessor: (row) => new Date(row.created_at).toLocaleString() ?? "—",
        },
        {
            key: "action",
            header: "Action",
            cell: (_value, row) => <Link to={`/institution/application/${row.id}`} className="tw-button-ghost text-xs">View</Link>,
        },
    ];

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
                    <DataTable
                        ref={tableRef}
                        columns={columns}
                        data={applications}
                        rowKey="id"
                    />
                </div>
            </div>
        </div>
    );
}