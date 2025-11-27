import { useNavigate } from "react-router";

export default function Consent() {
    const navigate = useNavigate();
    return <div className="flex flex-col">
        <div className="flex flex-row justify-between items-center mb-4">
            <h1 className="tw-h1">Consent Management</h1>
            <button onClick={() => { navigate("/institution/create")}} className="tw-button cursor-pointer">Create Consent</button>
        </div>

    </div>
}