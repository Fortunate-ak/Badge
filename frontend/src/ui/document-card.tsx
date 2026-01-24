import { useRef } from "react";
import { useToast } from "../context/ToastContext";
import type { Document } from "../types";
import { documentService } from "../services/document.service";


export default function DocumentCard({ value }: { value: Document }) {
    const toast = useToast();
    const deleted = useRef(false);

    const deleteFunc = () => {
        toast.confirm("Are you sure you want to delete " + value.title, { cancelText: "No", confirmText: "Yes" }).then(val => {
            if (val) {
                const toastId = toast.loading('Working on it...', {
                    progress: 0,
                    description: 'Deleting file'
                });

                documentService.delete(value.id).then(() => {
                    // 3. Update to Success
                    toast.update(toastId, {
                        type: 'success',
                        message: 'Successfully Deleted',
                        description: '',
                        progress: 100,
                    });
                    deleted.current = true;
                }).catch((err) => {
                    toast.update(toastId, {
                        type: 'error',
                        message: "Couldn't delete document. ",
                        description: JSON.stringify(err),
                        progress: 100,
                    });
                })
            }
        })
    }

    if (deleted.current) {
        return <></>
    }
    return <div className="flex flex-col p-4 border border-border rounded-md bg-secondary group transition-all cursor-pointer">
        <div className="flex flex-row justify-between items-center w-full">
            <span className="mso filled text-6xl font-bold text-muted">picture_as_pdf</span>
            <button onClick={() => deleteFunc()} popoverTarget={"menu-items-" + value.id} className="mso text-xl place-self-start" style={{ 'anchorName': '--menu-anchor-' + value.id } as any}>delete</button>
            {/*<div popover="auto" id={"menu-items-"+id} className="fixed *:text-sm top-[anchor(bottom)] left-[anchor(left)] bg-secondary border border-border p-2 rounded-md shadow-lg" style={{'positionAnchor' : '--menu-anchor-'+id} as any}>
                <button onClick={() => console.log("Cliked yey!")}>Delete Now</button>
                <button></button>
            </div>*/}
        </div>
        <h2 className="font-semibold line-clamp-1">{value.title}</h2>
        <span className="text-xs">{value.type}</span>
        {value.updated_at && <span className="text-xs">Uploaded on {new Date(value.updated_at).toLocaleDateString()}</span>}
    </div>
}