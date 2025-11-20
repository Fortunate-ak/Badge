import { Route } from "react-router";

export default function ApplicantRoutes() {
    return <Route path="applicant">
        <Route index element={<div>Applicant Home</div>} />
    </Route>
}