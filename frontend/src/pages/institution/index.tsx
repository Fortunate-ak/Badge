import { Route } from "react-router";
import Opportunities from "./opportunities";
import Applicants from "./applicants";
import Consent from "./consent";
import OpportunityDetails from "./components/opportunity-details";
import ApplicationDetails from "./components/application-details";


export default function InstitutionRoutes() {
    return <Route path="institution">
        <Route index element={<Opportunities />} />
        <Route path="applicants" element={<Applicants />} />
        <Route path="consent" element={<Consent />} />
        <Route path="opportunity/:id" element={<OpportunityDetails />} />
        <Route path="application/:id" element={<ApplicationDetails />} />
    </Route>
}