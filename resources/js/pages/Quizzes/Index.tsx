import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { GraduationCap, Plus } from 'lucide-react';

interface Quiz {
    id: number;
    title: string;
    num_questions: number;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    created_at: string;
    pdf_document: {
        id: number;
        title: string;
    };
}

interface Props {
    quizzes: Quiz[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Quizzes',
        href: '/quizzes',
    },
];

export default function Index({ quizzes }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Quizzes" />
            <div className="flex flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Quizzes</h1>
                </div>

                {quizzes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                        <GraduationCap className="mb-2 h-12 w-12 text-gray-400" />
                        <h2 className="mb-1 text-xl font-medium">No quizzes yet</h2>
                        <p className="mb-4 text-sm text-gray-500">
                            Create a quiz from any of your PDF documents to test your knowledge.
                        </p>
                        <Button asChild>
                            <Link href="/pdf-documents">
                                <Plus className="mr-2 h-4 w-4" />
                                Go to PDF Documents
                            </Link>
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {quizzes.map((quiz) => (
                            <Link
                                key={quiz.id}
                                href={`/quizzes/${quiz.id}`}
                                className="flex flex-col rounded-lg border p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-900"
                            >
                                <div className="mb-2 flex items-center">
                                    <GraduationCap className="mr-2 h-5 w-5 text-blue-500" />
                                    <h3 className="font-medium">{quiz.title}</h3>
                                </div>
                                <div className="mb-2 text-sm text-gray-500">
                                    From: {quiz.pdf_document.title}
                                </div>
                                <div className="mb-2 text-sm text-gray-500">
                                    {quiz.num_questions} questions
                                </div>
                                <div className="mb-2 text-sm text-gray-500">
                                    {new Date(quiz.created_at).toLocaleDateString()}
                                </div>
                                <div className="mt-auto">
                                    <span
                                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                            quiz.status === 'completed'
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                                : quiz.status === 'processing'
                                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                                                : quiz.status === 'failed'
                                                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                                        }`}
                                    >
                                        {quiz.status.charAt(0).toUpperCase() + quiz.status.slice(1)}
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
