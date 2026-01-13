import { customFetch } from ".";
import type { User } from "../types";

export async function LoginUser(email: string, password: string) {
    let response = await customFetch('/api/auth/login/', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ email, password }),
    });
    if (response.status == 401) {
        throw new Error("Invalid credentials. ")
    }
    if (!response.ok) {
        throw new Error('Failed to fetch user. ');
    }
    return response.json();
}

export async function LogoutUser() {
    let response = await customFetch('/api/auth/logout/');
    if (!response.ok) {
        throw new Error('Failed to logout. ');
    }
    return response.json();
}


export async function RegisterUser(email: string, password: string, first_name: string, last_name: string, bio: string, dob: string | Date, is_institution_staff: boolean, password_confirm : string, interests: string[]) {
    let response = await customFetch('/api/auth/register/', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            email,
            password,
            first_name,
            last_name,
            bio,
            dob,
            is_institution_staff,
            password_confirm,
            interests
        })
    });
    if (response.status == 400) {
        console.log(response);
        throw new Error("Error occured. ")
    }
    if (!response.ok) {
        throw new Error('Error occured');
    }
    return response.json();
}


export async function GetCurrentUser() {
    let response = await customFetch('/api/auth/me/')
    if (response.status == 401) {
        return null;
    }
    if (!response.ok) {
        throw new Error('Failed to fetch user. ');
    }
    return response.json() as Promise<User>;
}