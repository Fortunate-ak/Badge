import { Route } from "react-router";
import Documents from "./documents";
import Consent from "./consent";
import Profile from "./profile";


export default function ApplicantRoutes() {
    return <Route path="applicant">
        <Route index element={<Documents />} />
        <Route path="consent" element={<Consent />} />
        <Route path="profile" element={<Profile />} />
    </Route>
}