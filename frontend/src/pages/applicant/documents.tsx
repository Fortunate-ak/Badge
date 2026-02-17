import { useState, useRef, useEffect } from "react";
import DocumentCard from "../../ui/document-card";
import type { Document, DocumentCategory, Verification, Institution } from "../../types";
import MinimalModal, {type ModalHandle } from "../../ui/layouts/modal";
import useForm from "../../ui/use-form";
import { documentService } from "../../services/document.service";
import { verificationService } from "../../services/verification.service";
import { institutionService } from "../../services/institution.service";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

export default function Documents() {
    const { user } = useAuth()
    const toast = useToast();
    const [docs, setDocs] = useState<Document[]>([]);
    const [categories, setCategories] = useState<DocumentCategory[]>([]);
    const modalRef = useRef<ModalHandle | null>(null);
    const detailsModalRef = useRef<ModalHandle | null>(null);
    const requestVerificationModalRef = useRef<ModalHandle | null>(null);

    const { values, handleChange, setValues } = useForm({ title: "", categories : new Array<string>(0), type: "PDF", file:(new File([], "")) });
    
    // For Details Modal
    const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
    const [verifications, setVerifications] = useState<Verification[]>([]);
    
    // For Request Verification
    const [institutions, setInstitutions] = useState<Institution[]>([]);
    const [selectedInstitution, setSelectedInstitution] = useState<string>("");

    const handleUpload = () => {
        modalRef.current?.close();
        documentService.upload(values.file, values.title, values.categories, user?.id).then((doc) => {
            setDocs([...docs, doc]);
        }).catch((err) => {
            console.error("Error uploading document:", err);
            toast.error("Failed to upload document");
        });
    };

    const openDetails = (doc: Document) => {
        setSelectedDoc(doc);
        detailsModalRef.current?.open();
        // Fetch verifications
        verificationService.getAll({ document_id: doc.id }).then((res) => {
            setVerifications(res);
        }).catch((err) => {
            console.error("Error fetching verifications:", err);
            toast.error("Failed to fetch verifications");
        });
    };

    const openRequestVerification = () => {
        // Fetch institutions
        institutionService.getAll().then((res) => {
            setInstitutions(res);
            requestVerificationModalRef.current?.open();
        }).catch(err => {
            toast.error("Failed to fetch institutions");
        });
    };

    const handleRequestVerification = async () => {
        if (!selectedDoc || !selectedInstitution) return;
        try {
            await verificationService.create({
                document: selectedDoc.id,
                institution: selectedInstitution,
                is_verified: false
            });
            toast.success("Verification requested");
            requestVerificationModalRef.current?.close();
            // Refresh verifications
             verificationService.getAll({ document_id: selectedDoc.id }).then((res) => {
                setVerifications(res);
            });
        } catch (e) {
            toast.error("Failed to request verification");
            console.error(e);
        }
    };

    // Fetch docs and categories on mount
    useEffect(() => {
        documentService.getAll().then((fetchedDocs) => {
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
                <DocumentCard value={doc} key={doc.id} onClick={() => openDetails(doc)} />
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
                <input required onChange={(e) => {setValues({ ...values, file: (e.target?.files || [])[0] || null })}} name="file" accept="application/pdf" type="file" className="tw-input cursor-pointer" />
                <button type="submit" className="tw-button cursor-pointer">Upload Document</button>
            </form>
        </MinimalModal>
        
        <MinimalModal ref={detailsModalRef} title="Document Details">
            {selectedDoc && (
                <div className="flex flex-col gap-4">
                     <div className="p-4 bg-secondary/30 rounded-md">
                        <h3 className="font-bold text-lg">{selectedDoc.title}</h3>
                        <p className="text-sm text-muted">Hash: {selectedDoc.file_hash}</p>
                        <p className="text-sm text-muted">ID: {selectedDoc.id}</p>
                        {selectedDoc.file && typeof selectedDoc.file === 'string' && (
                             <a href={selectedDoc.file.replace("localhost", window.location.host)} target="_blank" rel="noreferrer" className="text-primary underline mt-2 block">View Document</a>
                        )}
                     </div>

                     <div className="flex justify-between items-center">
                        <h4 className="font-bold">Verifications</h4>
                        <button onClick={openRequestVerification} className="tw-button tw-button-sm text-xs py-2 px-3">Request Verification</button>
                     </div>
                     
                     {verifications.length === 0 ? (
                         <p className="text-muted italic">No verifications found.</p>
                     ) : (
                         <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                             {verifications.map(v => (
                                 <div key={v.id} className="border border-border p-2 rounded-md flex justify-between items-center text-sm">
                                     <div>
                                         <p className="font-semibold">{v.institution_details?.name || "Unknown Institution"}</p>
                                         <p className="text-xs text-muted">{new Date(v.created_at).toLocaleDateString()}</p>
                                     </div>
                                     <div className="text-right">
                                         {v.is_verified ? (
                                             <span className="text-green-600 font-bold">Verified</span>
                                         ) : v.rejection_reason ? (
                                             <span className="text-red-600 font-bold">Rejected</span>
                                         ) : (
                                             <span className="text-yellow-600 font-bold">Pending</span>
                                         )}
                                     </div>
                                 </div>
                             ))}
                         </div>
                     )}
                </div>
            )}
        </MinimalModal>

        <MinimalModal ref={requestVerificationModalRef} title="Request Verification">
            <div className="flex flex-col gap-4">
                <p>Select an institution to verify this document:</p>
                <select 
                    className="tw-input" 
                    value={selectedInstitution} 
                    onChange={(e) => setSelectedInstitution(e.target.value)}
                >
                    <option value="">-- Select Institution --</option>
                    {institutions.map(inst => (
                        <option key={inst.id} value={inst.id}>{inst.name}</option>
                    ))}
                </select>
                <button 
                    onClick={handleRequestVerification} 
                    disabled={!selectedInstitution}
                    className="tw-button disabled:opacity-50"
                >
                    Submit Request
                </button>
            </div>
        </MinimalModal>
    </div>
}
