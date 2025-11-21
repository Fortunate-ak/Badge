import { Route } from "react-router";
import Opportunities from "./opportunities";
import Documents from "./documents";


export default function ApplicantRoutes() {
    return <Route path="applicant">
        <Route index element={<Opportunities />} />
        <Route path="opportunities" element={<Opportunities />} />
        <Route path="documents" element={<Documents />} />
    </Route>
}