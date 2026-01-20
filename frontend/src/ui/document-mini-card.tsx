import type { Document } from "../types";



export default function DocumentMiniCard({value} : {value?: Document}) {
    return <a target="_blank" href={value?.file?.toString().replace("localhost", window.location.host)} className="tw-tag rounded-md! flex flex-row items-center gap-1">
        <span className="mso filled text-4xl font-bold text-muted">picture_as_pdf</span>
        <div className="flex flex-col flex-1">
            <span className="line-clamp-1">{value?.title}</span>
            <span className="text-xs text-muted line-clamp-1">{value?.type}</span>
        </div>
        <span className="mso">open_in_new</span>
    </a>
}