import DocumentCard from "../../ui/document-card";




export default function Documents() {
    return <div className="grid grid-cols-4 gap-4">
        <DocumentCard title="Resume.pdf" type="PDF Document" timestamp="2024-06-01T12:00:00Z" />
        <DocumentCard title="CoverLetter.docx" type="Word Document" timestamp="2024-05-28T09:30:00Z" />
        <DocumentCard title="Portfolio.zip" type="ZIP Archive" timestamp="2024-05-15T15:45:00Z" />
        <DocumentCard title="References.txt" type="Text Document" timestamp="2024-04-20T11:20:00Z" />
        <DocumentCard title="References.txt" type="Text Document" timestamp="2024-04-20T11:20:00Z" />


        <div className="flex flex-row col-start-1 items-center gap-2 cursor-pointer border border-foreground border-dashed bg-primary/10 rounded-md p-4">
            <span className="text-2xl mso">add_2</span>
            <span>Add New</span>
        </div>
    </div>
}