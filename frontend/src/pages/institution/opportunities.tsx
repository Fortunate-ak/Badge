import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import {opportunityService} from "../../services/opportunity.service";
import type { Opportunity } from "../../types";
import Modal, { type ModalHandle } from "../../ui/layouts/modal";
import OpportunityForm from "./components/opportunity-form";

export default function Opportunities() {
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | undefined>();
    const modalRef = useRef<ModalHandle | null>(null);

    useEffect(() => {
        opportunityService.getAll().then(setOpportunities);
    }, []);

    const handleCreate = (opportunity: Partial<Opportunity>) => {
        opportunityService.create(opportunity).then((newOpportunity) => {
            setOpportunities([...opportunities, newOpportunity]);
            modalRef.current?.close();
        });
    };

    const handleUpdate = (opportunity: Partial<Opportunity>) => {
        if (selectedOpportunity) {
            opportunityService.update(selectedOpportunity.id, opportunity).then(
                (updatedOpportunity) => {
                    setOpportunities(
                        opportunities.map((o) =>
                            o.id === updatedOpportunity.id ? updatedOpportunity : o
                        )
                    );
                    modalRef.current?.close();
                }
            );
        }
    };

    const handleDelete = (id: string) => {
        opportunityService.delete(id).then(() => {
            setOpportunities(opportunities.filter((o) => o.id !== id));
        });
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Opportunities</h1>
                <button
                    className="tw-button"
                    onClick={() => {
                        setSelectedOpportunity(undefined);
                        modalRef.current?.open();
                    }}
                >
                    Create Opportunity
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {opportunities.map((opportunity) => (
                    <div key={opportunity.id} className="p-4 border rounded-md">
                        <h2 className="text-lg font-bold">{opportunity.title}</h2>
                        <p className="text-sm text-gray-500">
                            {opportunity.opportunity_type}
                        </p>
                        <p>{opportunity.description}</p>
                        <div className="flex gap-2 mt-4">
                            <Link
                                to={`/institution/opportunity/${opportunity.id}`}
                                className="tw-button-ghost text-xs"
                            >
                                View
                            </Link>
                            <button
                                className="tw-button-ghost text-xs"
                                onClick={() => {
                                    setSelectedOpportunity(opportunity);
                                    modalRef.current?.open();
                                }}
                                disabled={(opportunity.applicant_count || 0) > 0}
                            >
                                Edit
                            </button>
                            <button
                                className="tw-button-ghost text-xs text-red-500"
                                onClick={() => handleDelete(opportunity.id)}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <Modal ref={modalRef}>
                <OpportunityForm
                    opportunity={selectedOpportunity}
                    onSubmit={selectedOpportunity ? handleUpdate : handleCreate}
                />
            </Modal>
        </div>
    );
}