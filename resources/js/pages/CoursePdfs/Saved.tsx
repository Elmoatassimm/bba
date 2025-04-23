import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, ChevronDown, Download, ExternalLink, FileText, Filter, GraduationCap, MoreVertical, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';

interface SavedPdf {
    id: number;
    title: string;
    course_id: string;
    pdf_url: string;
    local_path: string;
    is_saved: boolean;
    created_at: string;
}

interface Props {
    savedPdfs: SavedPdf[];
    message?: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Course PDFs',
        href: '/course-pdfs',
    },
    {
        title: 'Saved PDFs',
        href: '/course-pdfs/saved',
    },
];

export default function Saved({ savedPdfs, message }: Props) {
    const [selectedPdfs, setSelectedPdfs] = useState<number[]>([]);
    const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
    const [filteredPdfs, setFilteredPdfs] = useState<SavedPdf[]>(savedPdfs);
    const [deleting, setDeleting] = useState<number | null>(null);
    const [batchDeleting, setBatchDeleting] = useState(false);

    // Extract unique course IDs from saved PDFs
    const courseIds = [...new Set(savedPdfs.map(pdf => pdf.course_id))];

    // Apply filters when selections change
    useEffect(() => {
        let result = [...savedPdfs];

        // Filter by selected courses if any
        if (selectedCourses.length > 0) {
            result = result.filter(pdf => selectedCourses.includes(pdf.course_id));
        }

        // Filter by selected PDFs if any
        if (selectedPdfs.length > 0) {
            result = result.filter(pdf => selectedPdfs.includes(pdf.id));
        }

        setFilteredPdfs(result);
    }, [selectedCourses, selectedPdfs, savedPdfs]);

    const handleSelectPdf = (pdfId: number) => {
        setSelectedPdfs(prev =>
            prev.includes(pdfId) ? prev.filter(id => id !== pdfId) : [...prev, pdfId]
        );
    };

    const handleSelectAllPdfs = () => {
        if (selectedPdfs.length === filteredPdfs.length) {
            setSelectedPdfs([]);
        } else {
            setSelectedPdfs(filteredPdfs.map(pdf => pdf.id));
        }
    };

    const handleCourseChange = (courseId: string) => {
        setSelectedCourses(prev =>
            prev.includes(courseId) ? prev.filter(id => id !== courseId) : [...prev, courseId]
        );
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to remove this PDF from your saved items?')) {
            setDeleting(id);
            router.delete(`/course-pdfs/${id}`, {
                onSuccess: () => {
                    setDeleting(null);
                    // Remove from selected PDFs if it was selected
                    setSelectedPdfs(prev => prev.filter(pdfId => pdfId !== id));
                },
                onError: () => {
                    setDeleting(null);
                },
            });
        }
    };

    const handleBatchDelete = () => {
        if (selectedPdfs.length === 0) return;

        if (confirm(`Are you sure you want to remove ${selectedPdfs.length} selected PDFs from your saved items?`)) {
            setBatchDeleting(true);

            // Create a promise for each delete operation
            const deletePromises = selectedPdfs.map(id =>
                fetch(`/course-pdfs/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    }
                })
            );

            // Execute all delete operations and refresh the page when done
            Promise.all(deletePromises)
                .then(() => {
                    setBatchDeleting(false);
                    setSelectedPdfs([]);
                    // Refresh the page to show updated list
                    window.location.reload();
                })
                .catch(() => {
                    setBatchDeleting(false);
                    alert('An error occurred while deleting some PDFs. Please try again.');
                });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Saved Course PDFs" />
            <div className="flex flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/course-pdfs">
                                <ArrowLeft className="mr-1 h-4 w-4" />
                                Back to Courses
                            </Link>
                        </Button>
                        <h1 className="text-2xl font-semibold">Saved PDFs</h1>
                    </div>
                    {selectedPdfs.length > 0 && (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleBatchDelete}
                            disabled={batchDeleting}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {batchDeleting ? 'Deleting...' : `Delete Selected (${selectedPdfs.length})`}
                        </Button>
                    )}
                </div>

                {message && (
                    <div className="rounded-md bg-blue-50 p-4 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200">
                        {message}
                    </div>
                )}

                <div className="mb-4 flex flex-wrap gap-2">
                    {courseIds.length > 1 && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="flex items-center gap-1">
                                    <Filter className="h-4 w-4" />
                                    Filter by Course
                                    <ChevronDown className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56">
                                <DropdownMenuLabel>Courses</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {courseIds.map((courseId) => (
                                    <DropdownMenuCheckboxItem
                                        key={courseId}
                                        checked={selectedCourses.includes(courseId)}
                                        onCheckedChange={() => handleCourseChange(courseId)}
                                    >
                                        Course {courseId}
                                    </DropdownMenuCheckboxItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}

                    <Button
                        variant="outline"
                        onClick={handleSelectAllPdfs}
                    >
                        {selectedPdfs.length === filteredPdfs.length && filteredPdfs.length > 0 ? 'Deselect All' : 'Select All'}
                    </Button>
                </div>

                {filteredPdfs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
                        <FileText className="mb-4 h-12 w-12 text-gray-400" />
                        <h3 className="mb-2 text-lg font-medium">No saved PDFs</h3>
                        <p className="mb-4 text-sm text-gray-500">
                            {selectedCourses.length > 0 || selectedPdfs.length > 0
                                ? 'No PDFs match your filter criteria. Try different filters.'
                                : 'You have not saved any PDFs yet.'}
                        </p>
                        <Button asChild>
                            <Link href="/course-pdfs">
                                <FileText className="mr-2 h-4 w-4" />
                                Browse Course PDFs
                            </Link>
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {filteredPdfs.map((pdf) => (
                            <Card
                                key={pdf.id}
                                className={`flex flex-col ${selectedPdfs.includes(pdf.id) ? 'border-primary ring-1 ring-primary' : ''}`}
                            >
                                <CardHeader>
                                    <div className="flex items-start gap-2">
                                        <Checkbox
                                            id={`pdf-${pdf.id}`}
                                            checked={selectedPdfs.includes(pdf.id)}
                                            onCheckedChange={() => handleSelectPdf(pdf.id)}
                                            className="mt-1"
                                        />
                                        <div className="flex-1">
                                            <CardTitle className="line-clamp-2 flex items-center gap-2">
                                                <FileText className="h-5 w-5 flex-shrink-0 text-blue-500" />
                                                <span>{pdf.title}</span>
                                            </CardTitle>
                                            <CardDescription className="line-clamp-1">
                                                Saved on {new Date(pdf.created_at).toLocaleDateString()}
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="mt-auto flex items-center justify-between">
                                    <div className="flex gap-2">
                                        <Button asChild>
                                            <Link href={`/course-pdfs/view/${pdf.id}`}>
                                                <FileText className="mr-2 h-4 w-4" />
                                                View
                                            </Link>
                                        </Button>
                                        <Button variant="outline" asChild>
                                            <a
                                                href={pdf.local_path ? `/storage/${pdf.local_path}` : pdf.pdf_url}
                                                download
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <Download className="mr-2 h-4 w-4" />
                                                Download
                                            </a>
                                        </Button>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                <MoreVertical className="h-4 w-4" />
                                                <span className="sr-only">Actions</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem asChild>
                                                <Link href={`/pdf-documents/create?title=${encodeURIComponent(pdf.title)}&url=${encodeURIComponent(pdf.pdf_url)}`}>
                                                    <GraduationCap className="mr-2 h-4 w-4" />
                                                    Create Quiz
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => handleDelete(pdf.id)}
                                                disabled={deleting === pdf.id}
                                                className="cursor-pointer text-red-600 focus:text-red-600"
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                {deleting === pdf.id ? 'Removing...' : 'Remove'}
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
