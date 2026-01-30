import { useState, useEffect, useRef } from 'react';
import { integrationService } from '../../services/integration.service';
import type { APIKey } from '../../types';
import MinimalModal, { type ModalHandle } from '../../ui/layouts/modal';
import useForm from '../../ui/use-form';

export default function DeveloperPage() {
    const [keys, setKeys] = useState<APIKey[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const createModalRef = useRef<ModalHandle>(null);

    const { values, handleChange, setValues } = useForm({ label: '' });

    const fetchKeys = async () => {
        try {
            const data = await integrationService.getAPIKeys();
            setKeys(data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchKeys();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await integrationService.createAPIKey(values.label);
            setValues({ label: '' });
            createModalRef.current?.close();
            fetchKeys();
        } catch (error) {
            console.error(error);
            alert("Failed to create key");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this API Key?")) return;
        try {
            await integrationService.deleteAPIKey(id);
            fetchKeys();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Developer API</h1>
                    <p className="text-muted-foreground mt-2">Manage API keys and view documentation for integrating with your systems.</p>
                </div>
                <button 
                    onClick={() => createModalRef.current?.open()}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors shadow-sm"
                >
                    Create API Key
                </button>
            </div>

            {/* Keys Table */}
            <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
                <div className="p-4 border-b border-border bg-muted/30">
                    <h2 className="font-semibold">Active API Keys</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
                            <tr>
                                <th className="px-6 py-3 font-medium">Label</th>
                                <th className="px-6 py-3 font-medium">Key</th>
                                <th className="px-6 py-3 font-medium">Created</th>
                                <th className="px-6 py-3 font-medium">Last Used</th>
                                <th className="px-6 py-3 font-medium">Requests</th>
                                <th className="px-6 py-3 text-right font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border bg-background">
                            {isLoading ? (
                                <tr><td colSpan={6} className="px-6 py-4 text-center">Loading...</td></tr>
                            ) : keys.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-4 text-center text-muted-foreground">No API keys found.</td></tr>
                            ) : (
                                keys.map(key => (
                                    <tr key={key.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4 font-medium text-foreground">{key.label}</td>
                                        <td className="px-6 py-4">
                                            <code className="font-mono text-xs bg-muted rounded px-2 py-1 select-all border border-border">{key.key}</code>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">{new Date(key.created_at).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-muted-foreground">{key.last_used_at ? new Date(key.last_used_at).toLocaleDateString() : '-'}</td>
                                        <td className="px-6 py-4 text-muted-foreground">{key.request_count}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => handleDelete(key.id)}
                                                className="text-destructive hover:text-destructive/80 font-medium text-sm"
                                            >
                                                Revoke
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Documentation */}
            <div className="bg-card border border-border rounded-lg p-6 space-y-6 shadow-sm">
                <div>
                    <h2 className="text-2xl font-bold mb-4">Documentation</h2>
                    <p className="text-secondary-foreground mb-4">
                        Authenticate all requests by including the <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-sm border border-border">X-Api-Key</code> header with your API key.
                    </p>
                    <div className="bg-muted/50 p-3 rounded-md border border-border font-mono text-sm text-muted-foreground">
                        curl -H "X-Api-Key: YOUR_API_KEY" https://api.badge.com/api/integrations/v1/opportunities/
                    </div>
                </div>

                <div className="space-y-4">
                    <EndpointDoc 
                        method="GET" 
                        path="/api/integrations/v1/opportunities/" 
                        desc="List all opportunities posted by your institution."
                    />
                    <EndpointDoc 
                        method="GET" 
                        path="/api/integrations/v1/opportunities/{id}/stats/" 
                        desc="Get application statistics for a specific opportunity."
                    />
                    <EndpointDoc 
                        method="GET" 
                        path="/api/integrations/v1/opportunities/{id}/applications/" 
                        desc="List all applications for a specific opportunity. Returns application details including applicant summary."
                    />
                     <EndpointDoc 
                        method="GET" 
                        path="/api/integrations/v1/applicants/{id}/" 
                        desc="Get full details of an applicant. Access is restricted to applicants who have applied to one of your opportunities."
                    />
                    <EndpointDoc 
                        method="POST" 
                        path="/api/integrations/v1/documents/verify/" 
                        desc="Upload and verify a document. Required fields: `email` (applicant email), `file` (multipart/form-data). Returns verification status."
                    />
                </div>
            </div>

            <MinimalModal ref={createModalRef} title="Create API Key">
                <form onSubmit={handleCreate} className="space-y-4 py-2">
                    <div>
                        <label htmlFor="key-label" className="block text-sm font-medium mb-1.5 text-foreground">Key Label</label>
                        <input 
                            id="key-label"
                            type="text" 
                            name="label" 
                            value={values.label} 
                            onChange={handleChange}
                            required
                            className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:border-input outline-none transition-shadow"
                            placeholder="e.g. Production Server, Zapier Integration"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Give this key a name to remember where it's used.</p>
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                        <button 
                            type="button"
                            onClick={() => createModalRef.current?.close()}
                            className="px-4 py-2 rounded-md hover:bg-muted text-sm font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 text-sm font-medium transition-colors"
                        >
                            Create Key
                        </button>
                    </div>
                </form>
            </MinimalModal>
        </div>
    );
}

function EndpointDoc({ method, path, desc }: { method: string, path: string, desc: string }) {
    return (
        <div className="border border-border rounded-md p-4 bg-background">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded w-fit uppercase tracking-wider ${
                    method === 'GET' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 
                    method === 'POST' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 
                    'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                }`}>
                    {method}
                </span>
                <code className="text-sm font-mono text-foreground break-all">{path}</code>
            </div>
            <p className="text-sm text-muted-foreground">{desc}</p>
        </div>
    )
}
