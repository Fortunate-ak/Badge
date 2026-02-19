import { createContext, useContext, useState, ReactNode } from "react";

interface SearchContextType {
    isSearchVisible: boolean;
    setSearchVisible: (visible: boolean) => void;
    searchValue: string;
    setSearchValue: (value: string) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: ReactNode }) {
    const [isSearchVisible, setSearchVisible] = useState(false);
    const [searchValue, setSearchValue] = useState("");

    return (
        <SearchContext.Provider value={{ isSearchVisible, setSearchVisible, searchValue, setSearchValue }}>
            {children}
        </SearchContext.Provider>
    );
}

export function useSearch() {
    const context = useContext(SearchContext);
    if (!context) {
        throw new Error("useSearch must be used within a SearchProvider");
    }
    return context;
}
