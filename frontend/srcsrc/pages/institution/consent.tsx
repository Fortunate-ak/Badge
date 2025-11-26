import { useEffect, useState } from "react";
import ConsentService from "../../../services/consent.service";
import type { ConsentLog } from "../../../types";

export default function Consent() {
    const [consentLogs, setConsentLogs]_ = useState<ConsentLog[]>([]);

    useEffect(() => {
        ConsentService.getAll().then(setConsentLogs);
    }, []);

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Consent Requests</h1>
            <div className="flex flex-col gap-4">
                {consentLogs.map((consentLog) => (
                    <div
                        key={consentLog.id}
                        className="p-4 border rounded-md flex justify-between items-center"
                    >
                        <div>
                            <p className="font-bold">
                                {typeof consentLog.requester_institution === "object" &&
                                    consentLog.requester_institution.name}
                            </p>
                            <p className="text-sm text-gray-500">
                                Requested on:{" "}
                                {new Date(consentLog.created_at).toLocaleDateString()}
                            </p>
                        </div>
                        <div>
                            <p
                                className={`font-bold ${
                                    consentLog.is_granted ? "text-green-500" : "text-yellow-500"
                                }`}
                            >
                                {consentLog.is_granted ? "Granted" : "Pending"}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}