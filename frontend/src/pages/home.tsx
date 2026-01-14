import React from "react";
import { GetCurrentUser } from "../utils/auth"
import type { User } from "../types";
import { Link } from "react-router";



export default function HomePage() {
    const [currentUser, setCurrentUser] = React.useState<User | null>(null);
    React.useEffect(() => {
    GetCurrentUser().then(user => setCurrentUser(user));
    }, [])
  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <h1 className="text-3xl">Welcome to the Home Page {currentUser?.first_name} {currentUser?.last_name}</h1>
        <p className="mb-4">This is the main landing page of the application.</p>
        {
            currentUser ? <span>
              <Link className="tw-button" to="/applicant">Applicant</Link>
              <Link className="tw-button ml-4" to="/institution">Institution</Link>
            </span> : <span className="mt-4">
                <Link to="/auth" className="tw-button"> Login</Link> or <Link className="tw-button" to="/auth/register"> Register</Link>
            </span>
        }
    </div>
  )
}