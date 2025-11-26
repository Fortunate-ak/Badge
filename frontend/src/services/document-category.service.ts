import {customFetch} from "../utils";
import type { DocumentCategory } from "../types";

const DocumentCategoryService = {
    getAll: async (): Promise<DocumentCategory[]> => {
        return customFetch("/api/document-categories/").then((res) => res.json());
    },
};

export default DocumentCategoryService;