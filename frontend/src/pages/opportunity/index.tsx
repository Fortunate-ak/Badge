import { Route } from "react-router";
import Opportunities from "./list";
import OpportunityViewPage from "./view";


export default function OpportunityRoutes() {
    return <Route path="opportunities">
        <Route index element={<Opportunities />} />
        <Route path=":id" element={<OpportunityViewPage />} />
    </Route>
}