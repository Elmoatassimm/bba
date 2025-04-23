import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, FileText } from 'lucide-react';
import { FormEvent } from 'react';

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
}

export default function Create({ document }: Props) {
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
        {
            title: 'Create Quiz',
            href: `/pdf-documents/${document.id}/quizzes/create`,
        },
    ];

    const { data, setData, post, processing, errors } = useForm({
        title: `Quiz on ${document.title}`,
        num_questions: 5,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(`/pdf-documents/${document.id}/quizzes`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Quiz" />
            <div className="flex flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/pdf-documents/${document.id}`}>
                                <ArrowLeft className="mr-1 h-4 w-4" />
                                Back
                            </Link>
                        </Button>
                        <h1 className="text-2xl font-semibold">Create Quiz</h1>
                    </div>
                </div>

                <div className="rounded-lg border">
                    <div className="border-b bg-gray-50 p-4 dark:bg-gray-900">
                        <div className="flex items-center">
                            <FileText className="mr-2 h-5 w-5 text-blue-500" />
                            <h2 className="text-lg font-medium">{document.title}</h2>
                        </div>
                    </div>
                    <div className="p-4">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Quiz Title</Label>
                                <Input
                                    id="title"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    required
                                />
                                {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="num_questions">Number of Questions</Label>
                                <Input
                                    id="num_questions"
                                    type="number"
                                    min="1"
                                    max="20"
                                    value={data.num_questions}
                                    onChange={(e) => setData('num_questions', parseInt(e.target.value))}
                                    required
                                />
                                {errors.num_questions && (
                                    <p className="text-sm text-red-500">{errors.num_questions}</p>
                                )}
                                <p className="text-xs text-gray-500">
                                    Choose between 1 and 20 questions for your quiz.
                                </p>
                            </div>

                            <div className="flex justify-end">
                                <Button type="submit" disabled={processing}>
                                    {processing ? (
                                        <>
                                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                                            Generating Quiz...
                                        </>
                                    ) : (
                                        'Generate Quiz'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
