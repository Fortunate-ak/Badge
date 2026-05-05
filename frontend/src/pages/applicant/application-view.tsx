import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { applicationService } from "../../services/application.service";
import type { ApplicationDetail } from "../../types";
import { timeAgo } from "../../utils";
import DocumentMiniCard from "../../ui/document-mini-card";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ApplicantApplicationView() {
    const { id } = useParams<{ id: string }>();
    const [application, setApplication] = useState<ApplicationDetail | null>(null);

    useEffect(() => {
        if (id) {
            applicationService.getById(id).then(setApplication).catch(console.error);
        }
    }, [id]);

    if (!application) {
        return <div className="p-4 text-center">Loading application details...</div>;
    }

    return (
        <div className="flex flex-col gap-6 max-w-4xl mx-auto">
            <div className="flex flex-row justify-between items-center">
                <Link to="/applicant/applications" className="flex items-center gap-1 text-sm text-muted hover:text-foreground">
                    <span className="mso text-lg">arrow_back</span>
                    Back to My Applications
                </Link>
                <span className={`tw-tag ${
                    application.status === 'Accepted' ? 'bg-green-100/5 text-green-500' :
                    application.status === 'Rejected' ? 'bg-red-100/5 text-red-500' :
                    'bg-blue-100/5 text-blue-700'
                }`}>
                    {application.status}
                </span>
            </div>

            <div className="flex flex-col gap-2">
                <h1 className="tw-h1">{application.opportunity.title}</h1>
                <p className="text-muted text-sm italic">Applied {timeAgo(application.created_at)}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6">
                <div className="flex flex-col gap-6">
                    <div className="tw-card p-4">
                        <h2 className="font-bold mb-4 flex items-center gap-2">
                            <span className="mso text-primary">analytics</span>
                            Match Analysis
                        </h2>
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-2">
                                <div className="relative size-16 flex items-center justify-center">
                                    <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                                        <path
                                            className="stroke-border fill-none"
                                            strokeWidth="3"
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        />
                                        <path
                                            className="stroke-primary fill-none"
                                            strokeWidth="3"
                                            strokeDasharray={`${application.match_record.match_percentage}, 100`}
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        />
                                    </svg>
                                    <span className="absolute text-xs font-bold">{Math.round(application.match_record.match_percentage)}%</span>
                                </div>
                                <span className="text-sm font-medium">Match Probability</span>
                            </div>

                            <div className="flex flex-col gap-3">
                                <div>
                                    <p className="text-xs font-bold text-green-500 uppercase tracking-wider mb-1">Strong Points</p>
                                    <p className="text-sm text-foreground/80 leading-relaxed italic border-l-2 border-green-500/30 pl-3">
                                        {application.match_record.winning_argument}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-1">Potential Gaps</p>
                                    <p className="text-sm text-foreground/80 leading-relaxed italic border-l-2 border-red-500/30 pl-3">
                                        {application.match_record.losing_argument}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="tw-card p-4">
                        <h2 className="font-bold mb-4 flex items-center gap-2">
                            <span className="mso text-primary">description</span>
                            Your Submission
                        </h2>
                        {application.letter ? (
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{application.letter}</ReactMarkdown>
                            </div>
                        ) : (
                            <p className="text-sm text-muted italic">No motivational letter provided.</p>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-6">
                    <div className="tw-card p-4">
                        <h2 className="font-bold mb-4 flex items-center gap-2">
                            <span className="mso text-primary">folder</span>
                            Verified Documents
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {application.documents.map((doc, idx) => (
                                <DocumentMiniCard key={idx} value={doc} />
                            ))}
                            {application.documents.length === 0 && (
                                <p className="text-sm text-muted italic col-span-full">No documents linked to this application.</p>
                            )}
                        </div>
                    </div>

                    {application.opportunity.specific_requirements && application.opportunity.specific_requirements.length > 0 && (
                        <div className="tw-card p-4">
                            <h2 className="font-bold mb-4 flex items-center gap-2">
                                <span className="mso text-primary">checklist</span>
                                Specific Requirements
                            </h2>
                            <div className="flex flex-col gap-3">
                                {application.opportunity.specific_requirements.map(req => {
                                    const docId = application.submitted_documents?.[req.id];
                                    const doc = application.submitted_documents_details?.find(d => d.id === docId);

                                    return (
                                        <div key={req.id} className="border border-border rounded-lg p-3 flex flex-row justify-between items-center gap-4 bg-secondary/10">
                                            <div className="flex flex-col min-w-0">
                                                <p className="font-semibold text-sm truncate">{req.label}</p>
                                                <span className={`text-[0.6rem] uppercase font-bold ${req.mandatory ? 'text-red-500' : 'text-muted'}`}>
                                                    {req.mandatory ? 'Mandatory' : 'Optional'}
                                                </span>
                                            </div>

                                            {doc ? (
                                                <div className="w-40 shrink-0">
                                                    <DocumentMiniCard value={doc} />
                                                </div>
                                            ) : (
                                                <span className="text-muted text-xs italic">Not submitted</span>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
