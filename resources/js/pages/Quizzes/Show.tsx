import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, FileText, GraduationCap, Play } from 'lucide-react';

interface QuizQuestion {
    id: number;
    question: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_answer: 'a' | 'b' | 'c' | 'd';
}

interface Quiz {
    id: number;
    title: string;
    num_questions: number;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    created_at: string;
    questions: QuizQuestion[];
}

interface PdfDocument {
    id: number;
    title: string;
    filename: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    summary: string | null;
    created_at: string;
}

interface Props {
    quiz: Quiz;
    document: PdfDocument;
}

export default function Show({ quiz, document }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Quizzes',
            href: '/quizzes',
        },
        {
            title: quiz.title,
            href: `/quizzes/${quiz.id}`,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={quiz.title} />
            <div className="flex flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/quizzes">
                                <ArrowLeft className="mr-1 h-4 w-4" />
                                Back
                            </Link>
                        </Button>
                        <h1 className="text-2xl font-semibold">{quiz.title}</h1>
                    </div>
                    {quiz.status === 'completed' && (
                        <Button asChild>
                            <Link href={`/quizzes/${quiz.id}/take`}>
                                <Play className="mr-2 h-4 w-4" />
                                Take Quiz
                            </Link>
                        </Button>
                    )}
                </div>

                <div className="rounded-lg border">
                    <div className="border-b bg-gray-50 p-4 dark:bg-gray-900">
                        <div className="flex items-center">
                            <FileText className="mr-2 h-5 w-5 text-blue-500" />
                            <h2 className="text-lg font-medium">
                                Based on: <Link href={`/pdf-documents/${document.id}`} className="hover:underline">{document.title}</Link>
                            </h2>
                        </div>
                    </div>
                    <div className="p-4">
                        <div className="mb-4 flex flex-wrap gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">Status:</span>
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
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">Questions:</span>
                                <span className="text-sm">{quiz.num_questions}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">Created:</span>
                                <span className="text-sm">{new Date(quiz.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>

                        {quiz.status === 'processing' ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-500"></div>
                                <p className="text-sm text-gray-500">Generating your quiz...</p>
                                <p className="mt-2 text-xs text-gray-400">This may take a few moments</p>
                                <p className="mt-4 text-xs text-gray-400">The AI is analyzing the content and creating questions</p>
                            </div>
                        ) : quiz.status === 'failed' ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-500">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-6 w-6"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </div>
                                <p className="text-sm text-gray-500">Failed to generate quiz</p>
                                <p className="mt-2 text-xs text-gray-400">
                                    There was an error processing your request. Please try again.
                                </p>
                                <div className="mt-4">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        asChild
                                    >
                                        <Link href={`/pdf-documents/${document.id}/quizzes/create`}>
                                            Try Again
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        ) : quiz.status === 'completed' && quiz.questions.length > 0 ? (
                            <div className="space-y-6">
                                <div className="rounded-lg border bg-gray-50 p-4 dark:bg-gray-900">
                                    <div className="flex items-center gap-2">
                                        <GraduationCap className="h-5 w-5 text-blue-500" />
                                        <h3 className="text-lg font-medium">Quiz Preview</h3>
                                    </div>
                                    <p className="mt-2 text-sm text-gray-500">
                                        This quiz contains {quiz.questions.length} multiple-choice questions based on the content of "{document.title}".
                                    </p>
                                    <div className="mt-4">
                                        <Button asChild>
                                            <Link href={`/quizzes/${quiz.id}/take`}>
                                                <Play className="mr-2 h-4 w-4" />
                                                Take Quiz
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <p className="text-sm text-gray-500">No questions available</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
