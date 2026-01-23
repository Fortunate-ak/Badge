import type { ConsentLog, Institution } from "../types";
import { timeAgo } from "../utils";

export default function ConsentCard({ value } : {value:ConsentLog}) {
    const logo = (new URL(value.requester_institution_details?.profile_image || "")).pathname;
    return <div className="p-4 border border-border rounded-md bg-secondary flex flex-col gap-2 cursor-pointer transition-all **:transition-all">
        <div className="flex flex-row items-start justify-between">
            <div className="flex flex-row items-center justify-between gap-2">
                {logo && <img src={logo} className="size-8 rounded-full border border-border p-0.5" />}
                <span className="text-xs font-semibold">{value.requester_institution_details?.name}</span>
            </div>
            <span className="text-xs opacity-50">{timeAgo(value.created_at)}</span>
        </div>
        
        <div className="flex flex-row flex-wrap gap-2">
        {
            value.document_categories_details?.map(tag => <span key={tag.id} className="tw-tag px-2 lowercase first-letter:uppercase">{tag.name}</span>)
        }
        </div>

        <div className="grid grid-cols-1 gap-2 text-sm!">
            {value.is_granted ? <button className="tw-button-secondary tw-button-sm text-sm cursor-pointer">REJECT</button> : <button className="tw-button tw-button-sm text-sm cursor-pointer">ACCEPT</button>}
        </div>
    </div>
}