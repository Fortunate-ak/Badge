import customFetch from "../utils";
import type { ConsentLog } from "../types";
import { unwrapList } from "./common";

const API_URL = "/api";

const ConsentService = {
    getAll: async (): Promise<ConsentLog[]> => {
        const response = await customFetch(`${API_URL}/consents/`, {
            method: "GET",
        });
        if (!response.ok) throw await response.json();
        const data = await response.json();
        return unwrapList<ConsentLog>(data);
    },

    get: async (id: string): Promise<ConsentLog> => {
        const response = await customFetch(`${API_URL}/consents/${id}/`, {
            method: "GET",
        });
        if (!response.ok) throw await response.json();
        return response.json();
    },

    create: async (data: Partial<ConsentLog>): Promise<ConsentLog> => {
        const response = await customFetch(`${API_URL}/consents/`, {
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

export default ConsentService;