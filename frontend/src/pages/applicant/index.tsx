import { Route } from "react-router";
import Documents from "./documents";
import Consent from "./consent";


export default function ApplicantRoutes() {
    return <Route path="applicant">
        <Route index element={<Documents />} />
        <Route path="consent" element={<Consent />} />
    </Route>
}