import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { FileText, Upload } from 'lucide-react';
import { FormEvent, useRef, useState } from 'react';

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
        title: 'Upload',
        href: '/pdf-documents/create',
    },
];

export default function Create() {
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        pdf_file: null as File | null,
    });

    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/pdf-documents', {
            forceFormData: true,
        });
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (file.type === 'application/pdf') {
                setData('pdf_file', file);
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            setData('pdf_file', e.target.files[0]);
        }
    };

    const handleButtonClick = () => {
        if (inputRef.current) {
            inputRef.current.click();
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Upload PDF" />
            <div className="mx-auto max-w-2xl p-4">
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold">Upload PDF Document</h1>
                    <p className="text-gray-500">Upload a PDF document to be summarized by AI</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="title">Document Title</Label>
                        <Input
                            id="title"
                            type="text"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            placeholder="Enter a title for your document"
                        />
                        {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="pdf_file">PDF File</Label>
                        <div
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${
                                dragActive
                                    ? 'border-primary bg-primary/5'
                                    : 'border-gray-300 hover:border-primary/50 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-900'
                            }`}
                            onClick={handleButtonClick}
                        >
                            <input
                                ref={inputRef}
                                id="pdf_file"
                                type="file"
                                accept="application/pdf"
                                onChange={handleChange}
                                className="hidden"
                            />
                            {data.pdf_file ? (
                                <>
                                    <FileText className="mb-2 h-10 w-10 text-blue-500" />
                                    <p className="mb-1 text-sm font-medium">{data.pdf_file.name}</p>
                                    <p className="text-xs text-gray-500">
                                        {(data.pdf_file.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                </>
                            ) : (
                                <>
                                    <Upload className="mb-2 h-10 w-10 text-gray-400" />
                                    <p className="mb-1 text-sm font-medium">Click to upload or drag and drop</p>
                                    <p className="text-xs text-gray-500">PDF (up to 10MB)</p>
                                </>
                            )}
                        </div>
                        {errors.pdf_file && <p className="text-sm text-red-500">{errors.pdf_file}</p>}
                    </div>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing || !data.title || !data.pdf_file}>
                            {processing ? (
                                <>
                                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                                    Uploading and Processing...
                                </>
                            ) : (
                                'Upload and Process'
                            )}
                        </Button>
                    </div>

                    {processing && (
                        <div className="mt-4 rounded-lg bg-blue-50 p-4 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                            <p className="font-medium">Your document is being processed</p>
                            <p className="mt-1 text-sm">This may take a few moments. You'll be redirected when complete.</p>
                            <p className="mt-2 text-xs">The AI service is analyzing your document and generating a summary.</p>
                        </div>
                    )}
                </form>
            </div>
        </AppLayout>
    );
}
