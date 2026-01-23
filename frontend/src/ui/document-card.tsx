

export default function DocumentCard({title, type, timestamp} : {title: string, type: string, timestamp?: string}) {
    return <div className="flex flex-col p-4 border border-border rounded-md bg-secondary group transition-all cursor-pointer">
        <div className="flex flex-row justify-between items-center w-full">
            <span className="mso filled text-6xl font-bold text-muted">picture_as_pdf</span>
            <span className="mso text-xl">more_vert</span>
        </div>
        <h2 className="font-semibold line-clamp-1">{title}</h2>
        <span className="text-xs">{type}</span>
        {timestamp && <span className="text-xs">Uploaded on {new Date(timestamp).toLocaleDateString()}</span>}
    </div>
}