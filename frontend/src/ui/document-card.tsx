

export default function DocumentCard({title, type, timestamp} : {title: string, type: string, timestamp?: string}) {
    return <div className="flex flex-col bg-primary/10 rounded-md p-4 hover:bg-primary/20 transition-all cursor-pointer">
        <div className="flex flex-row justify-between items-center w-full">
            <span className="mso filled text-6xl font-bold text-muted">picture_as_pdf</span>
            <span className="mso text-xl">more_vert</span>
        </div>
        <h2 className="font-semibold line-clamp-1">{title}</h2>
        <span className="text-xs">{type}</span>
        {timestamp && <span className="text-xs">Uploaded on {new Date(timestamp).toLocaleDateString()}</span>}
    </div>
}