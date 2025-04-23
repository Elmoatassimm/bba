import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { FileText, Plus } from 'lucide-react';

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

export default function Index({ documents }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="PDF Documents" />
            <div className="flex flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">PDF Documents</h1>
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
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {documents.map((document) => (
                            <Link
                                key={document.id}
                                href={`/pdf-documents/${document.id}`}
                                className="flex flex-col rounded-lg border p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-900"
                            >
                                <div className="mb-2 flex items-center">
                                    <FileText className="mr-2 h-5 w-5 text-blue-500" />
                                    <h3 className="font-medium">{document.title}</h3>
                                </div>
                                <div className="mb-2 text-sm text-gray-500">
                                    {new Date(document.created_at).toLocaleDateString()}
                                </div>
                                <div className="mt-auto">
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
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
