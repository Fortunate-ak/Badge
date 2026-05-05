import { Route } from "react-router";
import Documents from "./documents";
import Consent from "./consent";
import Profile from "./profile";
import ApplicantApplications from "./applications";
import ApplicantApplicationView from "./application-view";


export default function ApplicantRoutes() {
    return <Route path="applicant">
        <Route index element={<Documents />} />
        <Route path="consent" element={<Consent />} />
        <Route path="profile" element={<Profile />} />
        <Route path="applications" element={<ApplicantApplications />} />
        <Route path="application/:id" element={<ApplicantApplicationView />} />
    </Route>
}