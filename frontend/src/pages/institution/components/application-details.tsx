import { useEffect, useRef, useState } from "react";
import { applicationService } from "../../../services/application.service";
import { consentService } from "../../../services/consent.service";
import type { ApplicationDetail } from "../../../types";
import { useParams } from "react-router";
import Modal, { type ModalHandle } from "../../../ui/layouts/modal";
import ConsentRequestModal from "./consent-request-modal";
import { useToast } from "../../../context/ToastContext";
import DocumentMiniCard from "../../../ui/document-mini-card";
import { timeAgo, APPLICATION_STATUSES } from "../../../utils";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ApplicationDetails() {
    const { id } = useParams<{ id: string }>();
    const toast = useToast();
    const [application, setApplication] = useState<ApplicationDetail | null>(null);
    const modalRef = useRef<ModalHandle | null>(null);

    useEffect(() => {
        if (id) {
            applicationService.getById(id).then(setApplication);
        }
    }, [id]);

    const handleStatusChange = async (newStatus: string) => {
        if (application && id) {
            try {
                const updated = await applicationService.updateStatus(id, newStatus);
                setApplication(prev => prev ? { ...prev, status: updated.status } : null);
                toast.success("Status updated successfully.");
            } catch (error) {
                toast.error("Failed to update status.");
            }
        }
    };

    const handleConsentRequest = (categoryIds: string[]) => {
        if (application) {
            consentService.create({
                applicant: application.applicant.id,
                document_categories: categoryIds,
                requester_institution: application.opportunity.posted_by_institution
            }).then(() => {
                modalRef.current?.close();
                toast.success("Consent Sent. ");
            });
        }
    };

    if (!application) {
        return <div>Loading...</div>;
    }

    return (
        <div className="md:grid grid-cols-[1fr_3fr] flex flex-col-reverse gap-4 items-start">
            <div className="flex flex-col p-4 pt-0">
                <img src={application.applicant.profile_image.replace("localhost", window.location.host)} alt="Profile Image" className="w-full p-2 border border-border rounded-full" />
                <h1 className="tw-h1 text-3xl font-bold">
                    {application.applicant.first_name}{" "}
                    {application.applicant.last_name}
                </h1>
                <p className="text-sm text-gray-500">
                    {application.applicant.bio}
                </p>

                <ul className="flex flex-col gap-1 *:flex *:flex-row *:gap-1 *:items-center *:text-sm">
                    <li>
                        <span className="mso text-xl text-muted">mail</span>
                        {application.applicant.email}
                    </li>
                    <li>
                        <span className="mso text-xl text-muted">event</span>
                        {application.applicant.dob}
                    </li>
                </ul>
            </div>


            <div className="rounded-xl border border-border p-4 flex flex-col w-full">
                <div className="flex flex-row justify-between items-center">
                    <p className="text-muted">{timeAgo(application.created_at)}</p>
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700">Status:</label>
                        <select
                            value={application.status}
                            onChange={(e) => handleStatusChange(e.target.value)}
                            className="tw-select py-1 pr-8 pl-3 text-sm min-w-[140px]"
                        >
                            {APPLICATION_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>

                {application.letter && (<>
                    <div className="mt-4 mb-2">
                        <h2 className="text-xl font-bold mb-2">Motivational Letter</h2>
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{application.letter}</ReactMarkdown>
                        </div>
                    </div>
                    <hr />
                    </>
                )}

                

                <h2 className="text-xl font-bold mt-4">Documents</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 my-4">
                    {
                        application.documents.map((val, k) => {
                            return <DocumentMiniCard key={k + "-docuemnt-mini-card"} value={val} />
                        })
                    }
                </div>

                <hr />
                <h2 className="text-xl font-bold mt-4">Match Analytics</h2>
                <div className="flex flex-col gap-2 *:text-sm">
                    <p>
                        <span className="font-thin text-xl">{application.match_record.match_percentage}% </span>
                         Match
                    </p>
                    <p>
                        <span className="font-bold text-base">Winning Argument</span><br />
                        {application.match_record.winning_argument}
                    </p>
                    <p>
                        <span className="font-bold text-base">Losing Argument</span><br />
                        {application.match_record.losing_argument}
                    </p>

                    
                </div>


                <button
                    className="tw-button mt-4"
                    onClick={() => modalRef.current?.open()}
                >
                    Request Consent
                </button>
            </div>
            <Modal ref={modalRef}>
                <ConsentRequestModal
                    onSubmit={handleConsentRequest}
                    applicant_id={application.applicant.id}
                    institution_id={application.opportunity.posted_by_institution}
                    onClose={() => modalRef.current?.close()}
                />
            </Modal>
        </div>
    );
}