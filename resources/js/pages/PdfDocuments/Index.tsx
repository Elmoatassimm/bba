import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import TypewriterEffect from '@/components/TypewriterEffect';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ChevronDown, FileText, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';

interface PdfDocument {
    id: number;
    title: string;
    filename: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    summary: string | null;
    created_at: string;
}

interface Props {
    documents: PdfDocument[];
    newDocumentId?: number;
    message?: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'PDF Documents',
        href: '/pdf-documents',
    },
];

export default function Index({ documents, newDocumentId, message }: Props) {
    const [selectedDocuments, setSelectedDocuments] = useState<number[]>([]);
    const [showTypewriterEffect, setShowTypewriterEffect] = useState(false);
    const [newDocument, setNewDocument] = useState<PdfDocument | null>(null);

    // Find the newly uploaded document if newDocumentId is provided
    useEffect(() => {
        if (newDocumentId) {
            const doc = documents.find(d => d.id === newDocumentId);
            if (doc && doc.status === 'completed' && doc.summary) {
                setNewDocument(doc);
                setShowTypewriterEffect(true);
            }
        }
    }, [newDocumentId, documents]);

    const handleSelectDocument = (id: number) => {
        setSelectedDocuments(prev =>
            prev.includes(id) ? prev.filter(docId => docId !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (selectedDocuments.length === documents.length) {
            setSelectedDocuments([]);
        } else {
            setSelectedDocuments(documents.map(doc => doc.id));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="PDF Documents" />
            <div className="flex flex-col gap-6 p-4">
                {/* Show success message */}
                {message && (
                    <div className="mb-2 rounded-lg border bg-green-50 p-4 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                        {message}
                    </div>
                )}

                {/* Show typewriter effect for newly uploaded document */}
                {showTypewriterEffect && newDocument && (
                    <div className="mb-2 rounded-lg border bg-blue-50 p-4 dark:bg-blue-900/30">
                        <div className="mb-2 flex items-center">
                            <FileText className="mr-2 h-5 w-5 text-blue-500" />
                            <h3 className="font-medium">{newDocument.title} - AI Summary</h3>
                        </div>
                        <div className="prose max-w-none dark:prose-invert">
                            <TypewriterEffect
                                text={newDocument.summary || ''}
                                typingSpeed={20}
                                onComplete={() => setShowTypewriterEffect(false)}
                                className="text-sm"
                            />
                        </div>
                        <div className="mt-2 text-right">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowTypewriterEffect(false)}
                            >
                                Dismiss
                            </Button>
                        </div>
                    </div>
                )}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-semibold">PDF Documents</h1>
                        {documents.length > 0 && selectedDocuments.length > 0 && (
                            <BatchActions
                                selectedDocuments={selectedDocuments}
                                onComplete={() => setSelectedDocuments([])}
                            />
                        )}
                    </div>
                    <Button asChild>
                        <Link href="/pdf-documents/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Upload PDF
                        </Link>
                    </Button>
                </div>

                {documents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
                        <FileText className="mb-4 h-12 w-12 text-gray-400" />
                        <h3 className="mb-2 text-lg font-medium">No PDF documents yet</h3>
                        <p className="mb-4 text-sm text-gray-500">Upload a PDF document to get started with AI summarization</p>
                        <div className="mb-6 max-w-md text-sm text-gray-500">
                            <p>Our AI service will analyze your PDF documents and generate concise summaries of their content.</p>
                            <p className="mt-2">Perfect for quickly understanding reports, research papers, legal documents, and more!</p>
                        </div>
                        <Button asChild>
                            <Link href="/pdf-documents/create">
                                <Plus className="mr-2 h-4 w-4" />
                                Upload PDF
                            </Link>
                        </Button>
                    </div>
                ) : (
                    <>
                        {documents.length > 0 && (
                            <div className="mb-2 flex items-center">
                                <Checkbox
                                    id="select-all"
                                    checked={selectedDocuments.length === documents.length && documents.length > 0}
                                    onCheckedChange={handleSelectAll}
                                />
                                <label htmlFor="select-all" className="ml-2 text-sm font-medium">
                                    {selectedDocuments.length === 0
                                        ? 'Select all'
                                        : selectedDocuments.length === documents.length
                                        ? 'Deselect all'
                                        : `Selected ${selectedDocuments.length} of ${documents.length}`}
                                </label>
                            </div>
                        )}
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {documents.map((document) => (
                                <div key={document.id} className="flex flex-col rounded-lg border p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-900">
                                    <div className="mb-2 flex items-center">
                                        <Checkbox
                                            id={`doc-${document.id}`}
                                            checked={selectedDocuments.includes(document.id)}
                                            onCheckedChange={() => handleSelectDocument(document.id)}
                                            className="mr-2"
                                        />
                                        <Link href={`/pdf-documents/${document.id}`} className="flex flex-1 items-center">
                                            <FileText className="mr-2 h-5 w-5 text-blue-500" />
                                            <h3 className="font-medium">{document.title}</h3>
                                        </Link>
                                    </div>
                                    <div className="mb-2 text-sm text-gray-500">
                                        {new Date(document.created_at).toLocaleDateString()}
                                    </div>
                                    <div className="mt-auto flex items-center justify-between">
                                        <span
                                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                document.status === 'completed'
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                                    : document.status === 'processing'
                                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                                                    : document.status === 'failed'
                                                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                                            }`}
                                        >
                                            {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
                                        </span>
                                        <Link
                                            href={`/pdf-documents/${document.id}`}
                                            className="text-xs text-blue-600 hover:underline dark:text-blue-400"
                                        >
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}

interface BatchActionsProps {
    selectedDocuments: number[];
    onComplete: () => void;
}

function BatchActions({ selectedDocuments, onComplete }: BatchActionsProps) {
    // Using a simple state for demo purposes instead of useForm
    const [deleting, setDeleting] = useState(false);

    const handleBatchDelete = () => {
        // In a real app, you would create a backend endpoint for batch deletion
        // For now, we'll just show how the UI would work
        if (confirm(`Are you sure you want to delete ${selectedDocuments.length} document(s)?`)) {
            setDeleting(true);
            // Simulate API call
            setTimeout(() => {
                alert(`This would delete ${selectedDocuments.length} documents. In a real app, you would implement a backend endpoint for this.`);
                setDeleting(false);
                onComplete();
            }, 500);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                    Actions
                    <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem
                    onClick={handleBatchDelete}
                    disabled={deleting}
                    className="cursor-pointer text-red-600 focus:text-red-600"
                >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {deleting ? 'Deleting...' : `Delete ${selectedDocuments.length} document(s)`}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
