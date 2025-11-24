import { useState } from "react";
import DocumentCard from "../../ui/document-card";
import type { Document } from "../../types";

export default function Documents() {

    const [docs, setDocs] = useState<Document[]>([]);

    return <div className="tw-dashboard-grid">

        {
            docs.map((doc) => (
                <DocumentCard key={doc.id} title={doc.title} type={doc.type} timestamp={doc.updated_at} />
            ))
        }
        <div className="flex flex-row col-start-1 items-center gap-2 cursor-pointer border border-foreground border-dashed bg-primary/10 rounded-md p-4">
            <span className="text-2xl mso">add_2</span>
            <span>Add New</span>
        </div>
    </div>
}