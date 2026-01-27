import { useEffect, useState, useRef, useMemo } from "react";
import { opportunityService } from "../../../services/opportunity.service";
import { DataTable, type Column, type DataTableHandle } from "../../../ui/data-table";
import type { Opportunity, Application } from "../../../types";
import { useParams, Link } from "react-router";
import { APPLICATION_STATUSES } from "../../../utils";

export default function OpportunityDetails() {
    const { id } = useParams<{ id: string }>();
    const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
    const [applications, setApplications] = useState<Application[]>([]);

    // Filter states
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("All");

    useEffect(() => {
        if (id) {
            opportunityService.getById(id).then(setOpportunity);
            opportunityService.getApplications(id).then(setApplications);
        }
    }, [id]);

    const tableRef = useRef<DataTableHandle<Application> | null>(null);

    // Derived state for filtering and analytics
    const { filteredApplications, analytics } = useMemo(() => {
        let filtered = applications;

        // Apply Search
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            filtered = filtered.filter(app =>
                app.applicant.first_name.toLowerCase().includes(lowerTerm) ||
                app.applicant.last_name.toLowerCase().includes(lowerTerm) ||
                app.applicant.email.toLowerCase().includes(lowerTerm)
            );
        }

        // Apply Status Filter
        if (filterStatus !== "All") {
            filtered = filtered.filter(app => app.status === filterStatus);
        }

        // Calculate Analytics (based on ALL applications)
        const stats = {
            total: applications.length,
            accepted: applications.filter(a => a.status === 'Accepted').length,
            rejected: applications.filter(a => a.status === 'Rejected').length,
            pending: applications.filter(a => ['Submitted', 'In Review', 'Pending Verification', 'Waitlisted'].includes(a.status)).length
        };

        return { filteredApplications: filtered, analytics: stats };
    }, [applications, searchTerm, filterStatus]);

    const columns: Column<Application>[] = [
        { key: "fullname", header: "FullName", accessor: (row) => row.applicant.first_name + " " + row.applicant.last_name },
        { key: "email", header : "Email", accessor: (row) => row.applicant.email },
        {
            key: "status",
            header: "Status",
            accessor: "status",
            cell: (val) => (
                <span className={`tw-tag ${
                    val === 'Accepted' ? 'bg-green-100 text-green-800' :
                    val === 'Rejected' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                }`}>
                    {val}
                </span>
            )
        },
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

            {/* Analytics Section */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="tw-card flex flex-col items-center justify-center p-4">
                    <span className="text-3xl font-bold">{analytics.total}</span>
                    <span className="text-sm text-gray-500">Total Applications</span>
                </div>
                <div className="tw-card flex flex-col items-center justify-center p-4">
                    <span className="text-3xl font-bold text-green-700">{analytics.accepted}</span>
                    <span className="text-sm text-green-600">Accepted</span>
                </div>
                <div className="tw-card flex flex-col items-center justify-center p-4">
                    <span className="text-3xl font-bold text-red-700">{analytics.rejected}</span>
                    <span className="text-sm text-red-600">Rejected</span>
                </div>
                <div className="tw-card flex flex-col items-center justify-center p-4">
                    <span className="text-3xl font-bold text-blue-700">{analytics.pending}</span>
                    <span className="text-sm text-blue-600">Pending / In Review</span>
                </div>
            </div>

            <div className="mt-8">
                <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                    <h2 className="text-xl font-bold">Applicants</h2>
                    <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                        <input
                            type="text"
                            placeholder="Search applicants..."
                            className="tw-input py-2"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <select
                            className="tw-select py-2 min-w-[150px]"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="All">All Statuses</option>
                            {APPLICATION_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>

                <div className="flex flex-col gap-4 mt-4">
                    <DataTable
                        ref={tableRef}
                        columns={columns}
                        data={filteredApplications}
                        rowKey="id"
                    />
                </div>
            </div>
        </div>
    );
}
