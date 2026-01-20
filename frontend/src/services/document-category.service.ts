import {customFetch} from "../utils";
import type { DocumentCategory } from "../types";
import { unwrapList } from "./common";

const DocumentCategoryService = {
    getAll: async (): Promise<DocumentCategory[]> => {
        return customFetch("/api/document-categories/").then((res) => unwrapList<DocumentCategory>(res.json()));
    },
};

export default DocumentCategoryService;