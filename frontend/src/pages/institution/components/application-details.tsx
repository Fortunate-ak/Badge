import { useEffect, useRef, useState } from "react";
import { applicationService} from "../../../services/application.service";
import { consentService } from "../../../services/consent.service";
import type { Application } from "../../../types";
import { useParams } from "react-router";
import Modal, { type ModalHandle } from "../../../ui/layouts/modal";
import ConsentRequestModal from "./consent-request-modal";

export default function ApplicationDetails() {
    const { id } = useParams<{ id: string }>();
    const [application, setApplication] = useState<Application | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const modalRef = useRef<ModalHandle | null>(null);

    useEffect(() => {
        if (id) {
            applicationService.getById(id).then(setApplication);
        }
    }, [id]);

    const handleConsentRequest = (categoryIds: string[]) => {
        if (application) {
            consentService.create({
                applicant: application.applicant.id,
                document_categories: categoryIds,
            }).then(() => {
                modalRef.current?.close();
            });
        }
    };

    if (!application) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1 className="text-2xl font-bold">
                {application.applicant.first_name}{" "}
                {application.applicant.last_name}
            </h1>
            <p className="text-sm text-gray-500">
                Applied for: {application.opportunity.title}
            </p>
            <div className="mt-8">
                <h2 className="text-xl font-bold">Documents</h2>
                <div className="flex flex-col gap-4 mt-4">
                    {/* TODO: Display documents once consent is granted */}
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
                    onClose={() => modalRef.current?.close()}
                />
            </Modal>
        </div>
    );
}