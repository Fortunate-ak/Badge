import { Route } from "react-router";
import Login from "./login";
import Register from "./register";


export default function AuthRoutes() {
    return <Route path="auth">
        <Route index element={<Login />} />
        <Route path="register" element={<Register />} />
    </Route>
}