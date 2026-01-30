import { useEffect, useState, useRef } from "react";
import { DataTable, type Column } from "../../ui/data-table";
import { verificationService } from "../../services/verification.service";
import type { Verification, User, DocumentCategory } from "../../types";
import { useToast } from "../../context/ToastContext";
import MinimalModal, { type ModalHandle } from "../../ui/layouts/modal";
import { institutionService } from "../../services/institution.service";
import useForm from "../../ui/use-form";
import { documentService } from "../../services/document.service";

export default function InstitutionDocuments() {
    const [verifications, setVerifications] = useState<Verification[]>([]);
    const [search, setSearch] = useState("");
    const toast = useToast();
    const [selectedVerification, setSelectedVerification] = useState<Verification | null>(null);
    const detailsModalRef = useRef<ModalHandle>(null);
    const uploadModalRef = useRef<ModalHandle>(null);

    // Upload State
    const [categories, setCategories] = useState<DocumentCategory[]>([]);
    const [verifiedApplicant, setVerifiedApplicant] = useState<User | null>(null);
    const { values, handleChange, setValues } = useForm({ 
        title: "", 
        type: "PDF", 
        applicant_email: "", 
        categories: [] as string[], 
        file: null as File | null 
    });

    const fetchVerifications = async () => {
        try {
            const data = await verificationService.getAll({ 
                applicant_name: search 
            });
            setVerifications(data);
        } catch (e) {
            console.error(e);
            toast.error("Failed to fetch verifications");
        }
    };

    useEffect(() => {
        fetchVerifications();
        documentService.getCategories().then(setCategories).catch(console.error);
    }, [search]);

    const verifyApplicant = async () => {
        try {
            const user = await institutionService.verifyUser(values.applicant_email);
            setVerifiedApplicant(user);
            toast.success("Applicant verified: " + user.first_name + " " + user.last_name);
        } catch (e) {
            setVerifiedApplicant(null);
            toast.error("User not found");
        }
    };

    const handleUpload = async () => {
         if (!verifiedApplicant || !values.file) {
             toast.error("Please verify applicant and select a file");
             return;
         }
         const toastId = toast.loading("Uploading and verifying...");
         try {
             await documentService.upload(values.file, values.title, values.categories, verifiedApplicant.id);
             toast.update(toastId, { type: 'success', message: "Document uploaded and verified" });
             uploadModalRef.current?.close();
             // Reset form
             setValues({ title: "", type: "PDF", applicant_email: "", categories: [], file: null });
             setVerifiedApplicant(null);
             fetchVerifications();
         } catch(e) {
             toast.update(toastId, { type: 'error', message: "Upload failed" });
         }
    };

    const handleAction = async (v: Verification, action: 'verify' | 'reject' | 'unverify', reason?: string) => {
        const toastId = toast.loading("Updating status...");
        try {
            if (action === 'verify') {
                await verificationService.update(v.id, { is_verified: true, rejection_reason: "" });
            } else if (action === 'unverify') {
                await verificationService.update(v.id, { is_verified: false });
            } else if (action === 'reject') {
                await verificationService.update(v.id, { is_verified: false, rejection_reason: reason || "Rejected" });
            }
            toast.update(toastId, { type: 'success', message: "Status updated" });
            fetchVerifications();
            if (detailsModalRef.current?.isOpen()) detailsModalRef.current.close();
        } catch (e) {
            toast.update(toastId, { type: 'error', message: "Failed to update status" });
        }
    };

    const openDetails = (v: Verification) => {
        setSelectedVerification(v);
        detailsModalRef.current?.open();
    };

    const columns: Column<Verification>[] = [
        {
            key: "created_at",
            header: "Date",
            cell: (_, row) => new Date(row.created_at).toLocaleDateString(),
        },
        {
            key: "applicant",
            header: "Applicant",
             cell: (_, row) => row.document_details?.applicant_details?.email || "Unknown"
        },
        {
            key: "document",
            header: "Document",
             cell: (_, row) => row.document_details?.title || row.document
        },
        {
            key: "status",
            header: "Status",
            cell: (_, row) => {
                if (row.is_verified) return <span className="text-green-600 font-bold">Verified</span>;
                if (row.rejection_reason) return <span className="text-red-600 font-bold">Rejected</span>;
                return <span className="text-yellow-600 font-bold">Pending</span>;
            }
        },
        {
            key: "actions",
            header: "Actions",
            cell: (_, row) => (
                <div className="flex gap-2">
                    {!row.is_verified && !row.rejection_reason && (
                        <>
                            <button onClick={(e) => { e.stopPropagation(); handleAction(row, 'verify'); }} className="tw-button-primary text-xs py-1 px-2">Verify</button>
                            <button onClick={(e) => { e.stopPropagation(); handleAction(row, 'reject', 'Rejected by institution'); }} className="tw-button-destructive text-xs py-1 px-2">Reject</button>
                        </>
                    )}
                    {row.is_verified && (
                        <button onClick={(e) => { e.stopPropagation(); handleAction(row, 'unverify'); }} className="tw-button-outline text-xs py-1 px-2">Un-verify</button>
                    )}
                </div>
            )
        }
    ];

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h1 className="tw-h1">Document Verifications</h1>
                <button onClick={() => uploadModalRef.current?.open()} className="tw-button-primary">Upload for Applicant</button>
            </div>
            
            <div className="mb-4">
                <input 
                    type="text" 
                    placeholder="Search applicant name..." 
                    className="tw-input max-w-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            <DataTable 
                columns={columns} 
                data={verifications} 
                rowKey="id"
                onRowClick={(row) => openDetails(row)}
            />

            <MinimalModal ref={detailsModalRef} title="Verification Details">
                {selectedVerification && (
                    <div className="flex flex-col gap-4">
                        <div>
                            <span className="font-bold">Status: </span>
                             {selectedVerification.is_verified ? "Verified" : (selectedVerification.rejection_reason ? "Rejected" : "Pending")}
                        </div>
                         {selectedVerification.rejection_reason && (
                            <div>
                                <span className="font-bold">Reason: </span>
                                {selectedVerification.rejection_reason}
                            </div>
                        )}
                        <div>
                             <span className="font-bold">Document: </span>
                             {selectedVerification.document_details?.title || selectedVerification.document}
                        </div>
                         {selectedVerification.document_details && (
                             <div className="bg-secondary/20 p-4 rounded-md">
                                 <h3 className="font-bold mb-2">Document Info</h3>
                                 <p className="text-sm">Type: {selectedVerification.document_details.type}</p>
                                 <p className="text-sm">Hash: {selectedVerification.document_details.file_hash}</p>
                                 {selectedVerification.document_details.file && typeof selectedVerification.document_details.file === 'string' && (
                                     <a href={selectedVerification.document_details.file} target="_blank" rel="noreferrer" className="text-primary underline text-sm block mt-2">Download/View File</a>
                                 )}
                             </div>
                         )}
                         
                         {selectedVerification.document_details?.applicant_details && (
                             <div className="bg-secondary/20 p-4 rounded-md">
                                 <h3 className="font-bold mb-2">Applicant Info</h3>
                                 <p className="text-sm">Name: {selectedVerification.document_details.applicant_details.first_name} {selectedVerification.document_details.applicant_details.last_name}</p>
                                 <p className="text-sm">Email: {selectedVerification.document_details.applicant_details.email}</p>
                             </div>
                         )}

                         <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                              {!selectedVerification.is_verified && !selectedVerification.rejection_reason && (
                                <>
                                    <button onClick={() => handleAction(selectedVerification, 'verify')} className="tw-button-primary">Verify</button>
                                    <button onClick={() => {
                                        const reason = prompt("Enter rejection reason:");
                                        if (reason) handleAction(selectedVerification, 'reject', reason);
                                    }} className="tw-button-destructive">Reject</button>
                                </>
                            )}
                            {selectedVerification.is_verified && (
                                <button onClick={() => handleAction(selectedVerification, 'unverify')} className="tw-button-outline">Un-verify</button>
                            )}
                         </div>
                    </div>
                )}
            </MinimalModal>

            <MinimalModal ref={uploadModalRef} title="Upload Document for Applicant">
                <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); handleUpload(); }}>
                    <div className="flex gap-2 items-end">
                        <div className="flex-1">
                             <label className="text-sm font-bold">Applicant Email</label>
                             <input 
                                required 
                                type="email" 
                                name="applicant_email" 
                                value={values.applicant_email} 
                                onChange={handleChange}
                                placeholder="applicant@example.com" 
                                className="tw-input" 
                            />
                        </div>
                        <button type="button" onClick={verifyApplicant} className="tw-button mb-[2px]">Verify User</button>
                    </div>
                    {verifiedApplicant && (
                         <div className="p-2 bg-green-100 text-green-800 rounded text-sm">
                             Verified: {verifiedApplicant.first_name} {verifiedApplicant.last_name}
                         </div>
                    )}
                    
                    <div>
                         <label className="text-sm font-bold">Document Title</label>
                         <input required onChange={handleChange} type="text" name="title" value={values.title} placeholder="Document Title" className="tw-input" />
                    </div>
                    
                    <div>
                         <label className="text-sm font-bold">Document Type</label>
                         <input required onChange={handleChange} type="text" name="type" value={values.type} placeholder="PDF, Image, etc." className="tw-input" />
                    </div>

                    <div>
                        <label className="text-sm font-bold">Categories</label>
                        <select name="categories" multiple required onChange={(e) => {
                            const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
                            setValues({ ...values, categories: selectedOptions });
                        }} className="tw-input h-24">
                            {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                        </select>
                    </div>
                    
                    <div>
                         <label className="text-sm font-bold">File</label>
                         <input required onChange={(e) => {setValues({ ...values, file: (e.target?.files || [])[0] || null })}} name="file" type="file" className="tw-input cursor-pointer" />
                    </div>

                    <button type="submit" disabled={!verifiedApplicant} className="tw-button-primary cursor-pointer disabled:opacity-50">Upload & Verify</button>
                </form>
            </MinimalModal>
        </div>
    );
}
