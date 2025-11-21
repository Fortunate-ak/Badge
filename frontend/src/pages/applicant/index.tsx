import { Route } from "react-router";
import Opportunities from "./opportunities";
import Documents from "./documents";
import Consent from "./consent";


export default function ApplicantRoutes() {
    return <Route path="applicant">
        <Route index element={<Opportunities />} />
        <Route path="opportunities" element={<Opportunities />} />
        <Route path="documents" element={<Documents />} />
        <Route path="consent" element={<Consent />} />
    </Route>
}