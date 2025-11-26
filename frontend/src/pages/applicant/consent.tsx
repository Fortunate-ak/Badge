import { useState } from "react";
import type { ConsentLog, Institution } from "../../types";
import ConsentCard from "../../ui/consent-card";
import React from "react";
import { consentService } from "../../services/consent.service";

export default function Consent() {

    const [consents, setConsents] = useState<ConsentLog[]>([]);

    React.useEffect(() => {
        consentService.getAll().then((data) => {
            setConsents(data);
        });
    }, []);

    return <div className="tw-dashboard-grid">
        {
            consents.map((content, index) => <ConsentCard key={index} title={content.id} tags={content.document_categories} company={(content.requester_institution as Institution).name} logo={(content.requester_institution as Institution).profile_image || ""} timestamp={content.created_at} />)
        }
    </div>
}