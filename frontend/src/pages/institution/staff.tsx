import { useEffect, useState, useRef } from "react";
import { Link } from "react-router";
import { institutionService } from "../../services/institution.service";
import type { InstitutionStaff, User } from "../../types";
import MinimalModal, { ModalHandle } from "../../ui/layouts/modal";
import { useAuth } from "../../context/AuthContext";

export default function Staff() {
    const { user } = useAuth();
    const [staff, setStaff] = useState<InstitutionStaff[]>([]);

    // Modal State
    const modalRef = useRef<ModalHandle>(null);
    const [email, setEmail] = useState("");
    const [foundUser, setFoundUser] = useState<User | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState("");
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        loadStaff();
    }, []);

    const loadStaff = () => {
        institutionService.getStaff().then(setStaff);
    };

    // Debounce verify user
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (email && email.includes("@")) {
                setIsVerifying(true);
                setFoundUser(null);
                setError("");
                institutionService.verifyUser(email)
                    .then(u => {
                        setFoundUser(u);
                        // Check if already staff in the context of the user's primary institution
                        const currentInstitutionId = user?.institution_details?.[0]?.id;
                        if (currentInstitutionId && staff.some(s => s.user === u.id && s.institution === currentInstitutionId)) {
                             setError("User is already a staff member.");
                             setFoundUser(null);
                        }
                    })
                    .catch(err => {
                        if (err.error === "User not found.") {
                            setError("User not found.");
                        } else {
                            // Don't show error if it's just a 404 from verify
                             if (err.status !== 404 && err.detail !== "Not found.") {
                                console.error(err);
                             } else {
                                 setError("User not found.");
                             }
                        }
                    })
                    .finally(() => setIsVerifying(false));
            } else {
                setFoundUser(null);
                setError("");
            }
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [email, staff, user]);

    const handleAddStaff = async () => {
        if (!foundUser || !user?.institution_details?.[0]?.id) return;
        setIsAdding(true);
        try {
            await institutionService.addStaff(user.institution_details[0].id, foundUser.email);
            modalRef.current?.close();
            loadStaff();
            setEmail("");
            setFoundUser(null);
        } catch (e: any) {
            setError(e.error || "Failed to add staff.");
        } finally {
            setIsAdding(false);
        }
    };

    const handleRemoveStaff = async (staffId: string) => {
        if (!confirm("Are you sure you want to remove this staff member?")) return;
        try {
            await institutionService.removeStaff(staffId);
            loadStaff();
        } catch (e) {
            alert("Failed to remove staff.");
        }
    };

    // Determine if current user is admin for the displayed staff rows.
    // For simplicity, we assume the page context is the first institution of the user.
    const currentInstitutionId = user?.institution_details?.[0]?.id;
    const isCurrentUserAdmin = staff.find(s => s.user === user?.id && s.institution === currentInstitutionId)?.is_admin;


    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h1 className="tw-h1">Staff Members</h1>
                {isCurrentUserAdmin && (
                    <button
                        className="tw-button-primary"
                        onClick={() => modalRef.current?.open()}
                    >
                        Add Staff
                    </button>
                )}
            </div>

            <div className="flex flex-col gap-4">
                {staff.map((member) => (
                    <div
                        key={member.id}
                        className="p-4 border border-border rounded-md flex justify-between items-center"
                    >
                        <div className="flex items-center gap-4">
                             {member.user_details?.profile_image ? (
                                <img src={member.user_details.profile_image} className="w-10 h-10 rounded-full object-cover" alt="" />
                             ) : (
                                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground font-bold uppercase">
                                    {member.user_details?.first_name?.[0]}
                                </div>
                             )}
                            <div>
                                <p className="font-bold">
                                    {member.user_details?.first_name}{" "}
                                    {member.user_details?.last_name}
                                </p>
                                <p className="text-sm text-gray-500">{member.user_details?.email}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                             {/* Show remove button if current user is admin of this member's institution, and not removing self */}
                            {isCurrentUserAdmin && member.user !== user?.id && member.institution === currentInstitutionId && (
                                <button
                                    onClick={() => handleRemoveStaff(member.id)}
                                    className="text-red-500 hover:text-red-700 text-sm font-semibold hover:underline cursor-pointer"
                                >
                                    Remove
                                </button>
                            )}
                            
                            <Link
                                to={`/institution`}
                                className="tw-button-ghost text-xs"
                            >
                                View Details
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            <MinimalModal ref={modalRef} title="Add Staff Member">
                <div className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">User Email</label>
                        <input
                            type="email"
                            className="tw-input w-full"
                            placeholder="Enter email address"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                        {isVerifying && <p className="text-sm text-gray-500 mt-1">Verifying...</p>}
                        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
                    </div>

                    {foundUser && (
                        <div className="flex items-center gap-3 p-3 border border-green-200 bg-green-50 rounded-md">
                             {foundUser.profile_image ? (
                                <img src={foundUser.profile_image} className="w-10 h-10 rounded-full object-cover" alt="" />
                             ) : (
                                <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center text-green-800 font-bold uppercase">
                                    {foundUser.first_name?.[0]}
                                </div>
                             )}
                             <div>
                                 <p className="font-bold">{foundUser.first_name} {foundUser.last_name}</p>
                                 <p className="text-xs text-gray-600">{foundUser.email}</p>
                             </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-2 mt-4">
                        <button
                            className="tw-button-ghost"
                            onClick={() => modalRef.current?.close()}
                        >
                            Cancel
                        </button>
                        <button
                            className="tw-button-primary"
                            disabled={!foundUser || isAdding}
                            onClick={handleAddStaff}
                        >
                            {isAdding ? "Adding..." : "Add Staff"}
                        </button>
                    </div>
                </div>
            </MinimalModal>
        </div>
    );
}
