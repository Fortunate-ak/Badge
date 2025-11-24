import { useState, useRef, useEffect } from "react";
import DocumentCard from "../../ui/document-card";
import type { Document, DocumentCategory } from "../../types";
import MinimalModal, {type ModalHandle } from "../../ui/layouts/modal";
import useForm from "../../ui/use-form";
import { documentService } from "../../services/document.service";

export default function Documents() {

    const [docs, setDocs] = useState<Document[]>([]);
    const [categories, setCategories] = useState<DocumentCategory[]>([]);
    const modalRef = useRef<ModalHandle | null>(null);
    const { values, handleChange, setValues } = useForm({ title: "", categories : new Array<string>(0), type: "PDF", file:(new File([], "")) });

    const handleUpload = () => {
        modalRef.current?.close();
        documentService.upload(values.file, values.categories, values.type).then((doc) => {
            setDocs([...docs, doc]);
        }).catch((err) => {
            console.error("Error uploading document:", err);
        });
    };


    // Fetch docs and categories on mount
    useEffect(() => {
        documentService.getAll().then((fetchedDocs) => {
            console.log("Fetched documents:", fetchedDocs);
            setDocs(fetchedDocs);
        }).catch((err) => {
            console.error("Error fetching documents:", err);
        });

        documentService.getCategories().then((fetchedCategories) => {
            setCategories(fetchedCategories);
        }).catch((err) => {
            console.error("Error fetching categories:", err);
        });
    }, []);


    return <div className="tw-dashboard-grid">

        {
            docs.map((doc) => (
                <DocumentCard key={doc.id} title={doc.title} type={doc.type} timestamp={doc.updated_at} />
            ))
        }
        <button onClick={() => modalRef.current?.open()} className="flex flex-row col-start-1 items-center gap-2 cursor-pointer border border-foreground/50 border-dashed bg-primary/10 rounded-md p-4">
            <span className="text-2xl mso">add_2</span>
            <span>Add New</span>
        </button>

        <MinimalModal ref={modalRef} title="Add Document">
            <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); handleUpload(); }}>
                <input required onChange={handleChange} type="text" name="title" value={values.title} placeholder="Document Title" className="tw-input" />
                <input required onChange={handleChange} type="text" name="type" value={values.type} placeholder="Document Type" className="tw-input" />

                <select name="categories" multiple required onChange={(e) => {
                    const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
                    setValues({ ...values, categories: selectedOptions });
                }} className="tw-input">
                    {
                        categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))
                    }
                </select>
                <input required onChange={(e) => {setValues({ ...values, file: (e.target?.files || [])[0] || null })}} name="file" accept="application/pdf" type="file" className="tw-input" />
                <button type="submit" className="tw-button cursor-pointer">Upload Document</button>
            </form>
        </MinimalModal>
    </div>
}