import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Download, FileText, GraduationCap, MoreVertical, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface CoursePdf {
    id: number;
    title: string;
    course_id: string;
    pdf_url: string;
    local_path: string;
    is_saved: boolean;
    created_at: string;
}

interface Props {
    pdf: CoursePdf;
    pdfUrl: string;
}

export default function View({ pdf, pdfUrl }: Props) {
    const [deleting, setDeleting] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Course PDFs',
            href: '/course-pdfs',
        },
        {
            title: 'Saved PDFs',
            href: '/course-pdfs/saved',
        },
        {
            title: pdf.title,
            href: `/course-pdfs/view/${pdf.id}`,
        },
    ];

    const handleDelete = () => {
        if (confirm('Are you sure you want to remove this PDF from your saved items?')) {
            setDeleting(true);
            router.delete(`/course-pdfs/${pdf.id}`, {
                onSuccess: () => {
                    router.visit('/course-pdfs/saved');
                },
                onError: () => {
                    setDeleting(false);
                },
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={pdf.title} />
            <div className="flex flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/course-pdfs/saved">
                                <ArrowLeft className="mr-1 h-4 w-4" />
                                Back
                            </Link>
                        </Button>
                        <h1 className="text-2xl font-semibold">{pdf.title}</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <a href={pdfUrl} download target="_blank" rel="noopener noreferrer">
                                <Download className="mr-1 h-4 w-4" />
                                Download PDF
                            </a>
                        </Button>
                        <Button size="sm" asChild>
                            <Link href={`/pdf-documents/create?title=${encodeURIComponent(pdf.title)}&url=${encodeURIComponent(pdfUrl)}`}>
                                <GraduationCap className="mr-1 h-4 w-4" />
                                Create Quiz
                            </Link>
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <MoreVertical className="h-4 w-4" />
                                    <span className="sr-only">Actions</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    className="cursor-pointer text-red-600 focus:text-red-600"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    {deleting ? 'Removing...' : 'Remove PDF'}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-1">
                    <div className="flex flex-col gap-4">
                        <div className="rounded-lg border">
                            <div className="border-b bg-gray-50 p-4 dark:bg-gray-900">
                                <h2 className="text-lg font-medium">PDF Preview</h2>
                            </div>
                            <div className="aspect-[3/4] p-4">
                                <iframe
                                    src={`${pdfUrl}#toolbar=0`}
                                    className="h-full w-full rounded border"
                                    title={pdf.title}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
