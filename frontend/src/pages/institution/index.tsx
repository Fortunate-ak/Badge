import { Route } from "react-router";
import Opportunities from "./opportunities";
import Staff from "./staff";
import InstitutionDocuments from "./documents";
import OpportunityDetails from "./components/opportunity-details";
import ApplicationDetails from "./components/application-details";
import CreateInstitutionPage from "./create";
import UpdateInstitutionPage from "./update";
import CreateOpportunity from "./create-opportunity";
import DeveloperPage from "./developer";


export default function InstitutionRoutes() {
    return <Route path="institution">
        <Route index element={<Opportunities />} />
        <Route path="create" element={<CreateInstitutionPage />} />
        <Route path=":id" element={<UpdateInstitutionPage />} />
        <Route path="staff" element={<Staff />} />
        <Route path="documents" element={<InstitutionDocuments />} />
        <Route path="opportunity/:id" element={<OpportunityDetails />} />
        <Route path="opportunity/create" element={<CreateOpportunity />} />
        <Route path="application/:id" element={<ApplicationDetails />} />
        <Route path="developer" element={<DeveloperPage />} />
    </Route>
}