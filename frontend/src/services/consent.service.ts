import {customFetch} from "../utils";
import type { ConsentLog } from "../types";
import { unwrapList } from "./common";

const API_URL = "/api";

export const consentService = {
    getAll: async (): Promise<ConsentLog[]> => {
        const response = await customFetch(`${API_URL}/consent-logs/`, {
            method: "GET",
        });
        if (!response.ok) throw await response.json();
        const data = await response.json();
        return unwrapList<ConsentLog>(data);
    },

    get: async (id: string): Promise<ConsentLog> => {
        const response = await customFetch(`${API_URL}/consent-logs/${id}/`, {
            method: "GET",
        });
        if (!response.ok) throw await response.json();
        return response.json();
    },

    accept: async (id: string): Promise<{status:string}> => {
        const response = await customFetch(`${API_URL}/consent-logs/${id}/accept/`, {
            method: "GET",
        });
        if (!response.ok) throw await response.json();
        return response.json();
    },

    revoke: async (id: string): Promise<{status:string}> => {
        const response = await customFetch(`${API_URL}/consent-logs/${id}/revoke/`, {
            method: "GET",
        });
        if (!response.ok) throw await response.json();
        return response.json();
    },

    check: async (document_categories: string[], institution_id : string, applicant_id : string): Promise<{[s: string]: boolean}> => {
        const response = await customFetch(`${API_URL}/consent-logs/check/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                document_categories, institution_id, applicant_id
            }),
        });
        if (!response.ok) throw await response.json();
        return response.json();
    },

    create: async (data: Partial<ConsentLog>): Promise<ConsentLog> => {
        const response = await customFetch(`${API_URL}/consent-logs/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw await response.json();
        return response.json();
    },
};

