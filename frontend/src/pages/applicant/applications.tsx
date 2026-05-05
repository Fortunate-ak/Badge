import { useEffect, useState } from "react";
import { applicationService } from "../../services/application.service";
import type { Application } from "../../types";
import { DataTable, type Column } from "../../ui/data-table";
import { Link } from "react-router";
import { timeAgo } from "../../utils";

export default function ApplicantApplications() {
    const [applications, setApplications] = useState<Application[]>([]);

    useEffect(() => {
        applicationService.getAll().then(setApplications).catch(console.error);
    }, []);

    const columns: Column<Application>[] = [
        {
            key: "opportunity",
            header: "Opportunity",
            cell: (_, row) => (
                <div className="flex flex-col">
                    <span className="font-bold">{row.opportunity.title}</span>
                    <span className="text-xs text-muted">{row.opportunity.opportunity_type}</span>
                </div>
            )
        },
        {
            key: "status",
            header: "Status",
            cell: (val) => (
                <span className={`tw-tag ${
                    val === 'Accepted' ? 'bg-green-100/5 text-green-500' :
                    val === 'Rejected' ? 'bg-red-100/5 text-red-500' :
                    'bg-blue-100/5 text-blue-700'
                }`}>
                    {val}
                </span>
            )
        },
        {
            key: "created_at",
            header: "Applied",
            accessor: "created_at",
            cell: (val) => timeAgo(val)
        },
        {
            key: "actions",
            header: "Actions",
            cell: (_, row) => (
                <Link to={`/applicant/application/${row.id}`} className="tw-button-ghost text-xs">View Details</Link>
            )
        }
    ];

    return (
        <div className="flex flex-col gap-4">
            <h1 className="tw-h1">My Applications</h1>
            <DataTable 
                columns={columns}
                data={applications}
                rowKey="id"
            />
        </div>
    );
}
