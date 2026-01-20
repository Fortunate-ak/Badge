import { useEffect, useRef, useState } from "react";
import type { Opportunity, Document } from "../../types";
import { timeAgo } from "../../utils";
import { useParams } from "react-router";
import { opportunityService } from "../../services/opportunity.service";
import React from "react";
import { useAuth } from "../../context/AuthContext";
import { applicationService } from "../../services/application.service";
import DocumentMiniCard from "../../ui/document-mini-card";
import { documentService } from "../../services/document.service";
import { useToast } from "../../context/ToastContext";
import MinimalModal, { type ModalHandle } from "../../ui/layouts/modal";
import { consentService } from "../../services/consent.service";



export default function OpportunityViewPage() {

    const [value, setValue] = useState<Opportunity | null>(null);
    const [docs, setDocs] = useState<Document[]>([]);
    let params = useParams();
    const { id } = params;

    useEffect(() => {
        // Fetch opportunity by ID here and setValue
        opportunityService.getById(id || "").then((data) => {
            setValue(data);
            console.log("Fetched opportunity data:", data);
        }).catch(console.error);

        documentService.getAll().then((fetchedDocs) => {
            console.log("Fetched documents:", fetchedDocs);
            setDocs(fetchedDocs);
        }).catch((err) => {
            console.error("Error fetching documents:", err);
        });
    }, [id]);



    return <div className="md:grid grid-cols-[1fr_3fr] flex flex-col-reverse gap-4 items-start">
        <div className="flex flex-col p-4 pt-0">
            <img src={(value?.institution_details?.profile_image)?.replace("localhost", window.location.host)} alt="company logo" className="w-full p-2 border border-border rounded-full" />
            <h2 className="text-2xl font-bold mt-2">{value?.institution_details?.name}</h2>
            <h3 className="text-sm">{value?.institution_details?.category}</h3>
            <p className="text-foreground/70 text-sm my-2">
                {value?.institution_details?.description}
            </p>


            <ul className="flex flex-col gap-1 *:flex *:flex-row *:gap-1 *:items-center *:text-sm">
                <li>
                    <span className="mso text-xl text-muted">location_on</span>
                    {value?.institution_details?.address}
                </li>
                <li>
                    <span className="mso text-xl text-muted">mail</span>
                    {value?.institution_details?.email}
                </li>
                <li>
                    <span className="mso text-xl text-muted">link</span>
                    {value?.institution_details?.website}
                </li>
                <li>
                    <span className="mso text-xl text-muted">phone</span>
                    {value?.institution_details?.phone}
                </li>
            </ul>

        </div>

        <div className="rounded-xl border border-border p-4 flex flex-col w-full">
            <div className="flex flex-row justify-between items-center mb-1">
                <span className="text-sm text-foreground/50">Posted {timeAgo(value?.updated_at || "12-12-12")}</span>
                {
                    id ? <ActionButton opportunityId={id} /> : null
                }


            </div>
            <div className="mb-2">
                <h1 className="text-3xl font-bold mb-2">{value?.title}</h1>
                <p className="mb-2">{value?.description}</p>

                <div className="flex flex-row gap-2 mb-2">
                    {
                        value?.tags?.map((tag, index) => <span key={index} className="tw-tag">{tag}</span>)
                    }
                </div>
            </div>
            <hr />

            <div className="flex flex-col gap-2 mt-4">
                <h1 className="text-xl font-semibold">Requested Documents</h1>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {
                        docs.map((v, k) => {
                            return v.categories.some(cat => value?.document_categories?.includes(cat)) && <DocumentMiniCard value={v} key={k + "-doc-mini-card"} />
                        })
                    }
                </div>
            </div>

            <hr className="mt-4" />

            <article className="flex flex-col gap-2 mt-4">
                <h1 className="text-xl font-semibold">Job Description</h1>
                {
                    value?.content
                }
            </article>
        </div>
    </div>
}

/**
 * This function returns the appropriate action button based on user. 
 * If the user is a viewer, it returns an "Apply Now" button. If the user has applied, it returns a see application status button.
 * If the user has editing rights, it returns an "edit" span.
 * @returns the correct action button
 */
function ActionButton({ opportunityId }: { opportunityId: string }) {
    const [hasApplied, setHasApplied] = React.useState<boolean | null>(null);
    const modalRef = useRef<ModalHandle | null>(null);
    const { user } = useAuth();
    const toast = useToast();

    React.useEffect(() => {
        opportunityService.hasApplied(opportunityId || "").then((hasAppliedValue) => {
            setHasApplied(hasAppliedValue.has_applied);
        }).catch(console.error);
    }, [opportunityId]);


    const applyNow = () => {
        /** When an applicant applies we automatically consent for all non-consented document categories that the oppportunity requires.  */
        opportunityService.getById(opportunityId || "").then(async (opp_val) => {
            let categories_check = await consentService.check(opp_val.document_categories || [], opp_val.posted_by_institution, user?.id || "");
            let non_consented_categories = Object.entries(categories_check).filter(val => !val[1]).map(val => val[0]);
            if (non_consented_categories.length != 0){
                consentService.create({
                    applicant: user?.id,
                    document_categories: non_consented_categories,
                    requester_institution: opp_val.institution_details?.id,
                    is_granted:true // auto granted
                })
            }
        });
        applicationService.apply(opportunityId || "").then(() => {
            toast.success("Successfully applied...");
            setHasApplied(true);
        }).catch(console.error);
    }

    if (hasApplied === null) {
        return <span>Loading...</span>;
    }

    if (!hasApplied) {
        return <button onClick={() => applyNow()} className="tw-button cursor-pointer">Apply Now</button>
    } else {
        return <button className="tw-button cursor-pointer">See Application Status</button>
    }
}