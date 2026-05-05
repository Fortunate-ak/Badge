import type { ConsentLog } from "../types";
import { timeAgo } from "../utils";
import { useState } from "react";

export default function ConsentCard({ value, onAction, onDeny }: { value: ConsentLog, onAction?: () => void, onDeny?: () => void }) {
    const [loading, setLoading] = useState(false);
    const logo = value.requester_institution_details?.profile_image ? (new URL(value.requester_institution_details.profile_image)).pathname : null;

    return <div className="p-4 border border-border rounded-md bg-card flex flex-col gap-4 cursor-pointer transition-all hover:border-primary/50 shadow-sm">
        <div className="flex flex-row items-start justify-between">
            <div className="flex flex-row items-center gap-3">
                <div className="size-10 rounded-full border border-border p-0.5 bg-muted flex items-center justify-center overflow-hidden">
                    {logo ? <img src={logo} className="w-full h-full object-cover" /> : <span className="mso text-muted-foreground">account_balance</span>}
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-bold">{value.requester_institution_details?.name}</span>
                    <span className="text-[10px] text-muted-foreground">{timeAgo(value.created_at)}</span>
                </div>
            </div>
            <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${value.is_granted ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                {value.is_granted ? 'Active' : 'Pending'}
            </div>
        </div>
        
        <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase text-muted-foreground">Requested Access:</span>
            <div className="flex flex-row flex-wrap gap-1.5">
                {
                    value.document_categories_details?.map(tag => (
                        <span key={tag.id} className="bg-secondary text-secondary-foreground px-2 py-0.5 rounded text-[11px] font-medium border border-border/50">
                            {tag.name}
                        </span>
                    ))
                }
            </div>
        </div>

        <div className="mt-2">
            {value.is_granted ? (
                <button 
                    disabled={loading}
                    onClick={(e) => { e.stopPropagation(); if(onAction) onAction(); }}
                    className="tw-button-secondary w-full tw-button-sm text-xs font-bold py-2"
                >
                    {loading ? 'Processing...' : 'REVOKE ACCESS'}
                </button>
            ) : (
                <div className="flex gap-2">
                    <button 
                        disabled={loading}
                        onClick={(e) => { e.stopPropagation(); if(onAction) onAction(); }}
                        className="tw-button flex-1 tw-button-sm text-xs font-bold py-2"
                    >
                        {loading ? '...' : 'GRANT'}
                    </button>
                    <button 
                        disabled={loading}
                        onClick={(e) => { e.stopPropagation(); if(onDeny) onDeny(); }}
                        className="tw-button-ghost text-destructive hover:bg-destructive/10 flex-1 tw-button-sm text-xs font-bold py-2"
                    >
                        {loading ? '...' : 'DENY'}
                    </button>
                </div>
            )}
        </div>
    </div>
}
