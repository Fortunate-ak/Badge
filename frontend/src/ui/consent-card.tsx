import { timeAgo } from "../utils";

export default function ConsentCard({ title, tags, company, logo, timestamp } : {title:string;tags:string[];company:string;logo:string;timestamp:string;}) {
    return <div className="rounded-lg p-4 flex flex-col gap-1 bg-primary/10 cursor-pointer transition-all **:transition-all group hover:bg-primary/90 hover:text-white">
        <div className="flex flex-row items-start justify-between">
            {logo && <img src={logo} className="size-8 rounded-full border border-border p-1" />}
            <span className="border border-border p-1 text-border rounded-md text-xs">
                Verified
            </span>
        </div>
        <div className="flex flex-row items-center justify-between">
            <span className="text-xs font-semibold">{company}</span>
            <span className="text-xs">{timeAgo(timestamp)}</span>
        </div>
        <h2 className="text-xl font-bold">{title}</h2>
        <div className="flex flex-row flex-wrap gap-2">
        {
            tags.map(tag => <span key={tag} className="tw-tag">{tag}</span>)
        }
        </div>
        

    </div>
}