import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Download, FileText, GraduationCap, MoreVertical, RefreshCw, Trash2 } from 'lucide-react';

interface PdfDocument {
    id: number;
    title: string;
    filename: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    summary: string | null;
    created_at: string;
}

interface Props {
    document: PdfDocument;
    pdfUrl: string;
}

export default function Show({ document, pdfUrl }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'PDF Documents',
            href: '/pdf-documents',
        },
        {
            title: document.title,
            href: `/pdf-documents/${document.id}`,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={document.title} />
            <div className="flex flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/pdf-documents">
                                <ArrowLeft className="mr-1 h-4 w-4" />
                                Back
                            </Link>
                        </Button>
                        <h1 className="text-2xl font-semibold">{document.title}</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        {document.status === 'completed' && (
                            <Button size="sm" asChild>
                                <Link href={`/pdf-documents/${document.id}/quizzes/create`}>
                                    <GraduationCap className="mr-1 h-4 w-4" />
                                    Create Quiz
                                </Link>
                            </Button>
                        )}
                        <Button variant="outline" size="sm" asChild>
                            <a href={pdfUrl} download={document.filename} target="_blank" rel="noopener noreferrer">
                                <Download className="mr-1 h-4 w-4" />
                                Download PDF
                            </a>
                        </Button>

                        <DocumentActions document={document} />
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <div className="flex flex-col gap-4">
                        <div className="rounded-lg border">
                            <div className="border-b bg-gray-50 p-4 dark:bg-gray-900">
                                <h2 className="text-lg font-medium">PDF Preview</h2>
                            </div>
                            <div className="aspect-[3/4] p-4">
                                <iframe
                                    src={`${pdfUrl}#toolbar=0`}
                                    className="h-full w-full rounded border"
                                    title={document.title}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="rounded-lg border">
                            <div className="border-b bg-gray-50 p-4 dark:bg-gray-900">
                                <h2 className="text-lg font-medium">AI Summary</h2>
                                <div className="mt-1">
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
                            </div>
                            <div className="p-4">
                                {document.status === 'completed' ? (
                                    <div className="prose max-w-none dark:prose-invert">
                                        <p className="whitespace-pre-line">{document.summary}</p>
                                    </div>
                                ) : document.status === 'processing' ? (
                                    <div className="flex flex-col items-center justify-center py-8 text-center">
                                        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-500"></div>
                                        <p className="text-sm text-gray-500">Processing your document...</p>
                                        <p className="mt-2 text-xs text-gray-400">This may take a few moments</p>
                                        <p className="mt-4 text-xs text-gray-400">The AI is analyzing the content and generating a summary</p>
                                    </div>
                                ) : document.status === 'failed' ? (
                                    <div className="rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                                        <p>There was an error processing this document.</p>
                                        <p className="mt-2 text-sm">Please try uploading the document again or contact support if the issue persists.</p>
                                    </div>
                                ) : (
                                    <div className="rounded-lg bg-gray-50 p-4 text-gray-800 dark:bg-gray-900 dark:text-gray-300">
                                        <p>Waiting to process this document.</p>
                                        <p className="mt-2 text-sm">The document is in the queue and will be processed shortly.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="rounded-lg border p-4">
                            <h3 className="mb-2 font-medium">Document Information</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Filename:</span>
                                    <span>{document.filename}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Uploaded:</span>
                                    <span>{new Date(document.created_at).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

interface DocumentActionsProps {
    document: PdfDocument;
}

function DocumentActions({ document }: DocumentActionsProps) {
    const { processing: reprocessing, post: reprocessPost } = useForm();
    const { processing: deleting, delete: deleteDoc } = useForm({ onBefore: () => confirm('Are you sure you want to delete this document?') });

    const handleReprocess = () => {
        reprocessPost(route('pdf-documents.reprocess', document.id));
    };

    const handleDelete = () => {
        deleteDoc(route('pdf-documents.destroy', document.id));
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Actions</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem
                    onClick={handleReprocess}
                    disabled={reprocessing || document.status === 'processing'}
                    className="cursor-pointer"
                >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    {reprocessing ? 'Reprocessing...' : 'Reprocess with AI'}
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={handleDelete}
                    disabled={deleting}
                    className="cursor-pointer text-red-600 focus:text-red-600"
                >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {deleting ? 'Deleting...' : 'Delete Document'}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
