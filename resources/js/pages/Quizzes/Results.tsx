import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Check, FileText, GraduationCap, X } from 'lucide-react';

interface QuizQuestion {
    id: number;
    question: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_answer: 'a' | 'b' | 'c' | 'd';
}

interface QuizAnswer {
    id: number;
    quiz_attempt_id: number;
    quiz_question_id: number;
    selected_answer: 'a' | 'b' | 'c' | 'd' | null;
    is_correct: boolean;
    question: QuizQuestion;
}

interface QuizAttempt {
    id: number;
    quiz_id: number;
    user_id: number;
    score: number;
    total_questions: number;
    completed_at: string;
    created_at: string;
    answers: QuizAnswer[];
}

interface Quiz {
    id: number;
    title: string;
    pdf_document_id: number;
}

interface PdfDocument {
    id: number;
    title: string;
}

interface Props {
    attempt: QuizAttempt;
    quiz: Quiz;
    document: PdfDocument;
}

export default function Results({ attempt, quiz, document }: Props) {
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
        {
            title: 'Results',
            href: `/quiz-attempts/${attempt.id}/results`,
        },
    ];

    const percentage = Math.round((attempt.score / attempt.total_questions) * 100);
    const getLetterGrade = (percentage: number) => {
        if (percentage >= 90) return 'A';
        if (percentage >= 80) return 'B';
        if (percentage >= 70) return 'C';
        if (percentage >= 60) return 'D';
        return 'F';
    };

    const getOptionLabel = (option: 'a' | 'b' | 'c' | 'd') => {
        return option.toUpperCase();
    };

    const getOptionText = (question: QuizQuestion, option: 'a' | 'b' | 'c' | 'd') => {
        switch (option) {
            case 'a':
                return question.option_a;
            case 'b':
                return question.option_b;
            case 'c':
                return question.option_c;
            case 'd':
                return question.option_d;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Quiz Results" />
            <div className="flex flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/quizzes/${quiz.id}`}>
                                <ArrowLeft className="mr-1 h-4 w-4" />
                                Back
                            </Link>
                        </Button>
                        <h1 className="text-2xl font-semibold">Quiz Results</h1>
                    </div>
                </div>

                <div className="rounded-lg border">
                    <div className="border-b bg-gray-50 p-4 dark:bg-gray-900">
                        <div className="flex items-center">
                            <GraduationCap className="mr-2 h-5 w-5 text-blue-500" />
                            <h2 className="text-lg font-medium">{quiz.title}</h2>
                        </div>
                        <div className="mt-1 text-sm text-gray-500">
                            Based on: <Link href={`/pdf-documents/${document.id}`} className="hover:underline">{document.title}</Link>
                        </div>
                    </div>
                    <div className="p-4">
                        <div className="mb-6 grid gap-4 md:grid-cols-3">
                            <div className="flex flex-col items-center justify-center rounded-lg border p-4">
                                <div className="text-4xl font-bold">{percentage}%</div>
                                <div className="text-sm text-gray-500">Score</div>
                            </div>
                            <div className="flex flex-col items-center justify-center rounded-lg border p-4">
                                <div className="text-4xl font-bold">{attempt.score}/{attempt.total_questions}</div>
                                <div className="text-sm text-gray-500">Correct Answers</div>
                            </div>
                            <div className="flex flex-col items-center justify-center rounded-lg border p-4">
                                <div className="text-4xl font-bold">{getLetterGrade(percentage)}</div>
                                <div className="text-sm text-gray-500">Grade</div>
                            </div>
                        </div>

                        <div className="mb-6">
                            <h3 className="mb-4 text-lg font-medium">Question Review</h3>
                            <div className="space-y-6">
                                {attempt.answers.map((answer, index) => (
                                    <div key={answer.id} className="rounded-lg border">
                                        <div className="border-b bg-gray-50 p-3 dark:bg-gray-900">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-medium">Question {index + 1}</h4>
                                                {answer.is_correct ? (
                                                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300">
                                                        <Check className="mr-1 h-3 w-3" />
                                                        Correct
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-300">
                                                        <X className="mr-1 h-3 w-3" />
                                                        Incorrect
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="p-3">
                                            <p className="mb-3 font-medium">{answer.question.question}</p>
                                            <div className="space-y-2">
                                                {(['a', 'b', 'c', 'd'] as const).map((option) => (
                                                    <div
                                                        key={option}
                                                        className={`flex items-center rounded-md border p-2 ${
                                                            answer.selected_answer === option && answer.is_correct
                                                                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                                                : answer.selected_answer === option && !answer.is_correct
                                                                ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                                                : option === answer.question.correct_answer && answer.selected_answer !== option
                                                                ? 'border-green-500 bg-green-50/50 dark:bg-green-900/10'
                                                                : ''
                                                        }`}
                                                    >
                                                        <div className="mr-2 flex h-6 w-6 items-center justify-center rounded-full border text-xs font-medium">
                                                            {getOptionLabel(option)}
                                                        </div>
                                                        <div className="flex-1">{getOptionText(answer.question, option)}</div>
                                                        {option === answer.question.correct_answer && (
                                                            <Check className="h-4 w-4 text-green-500" />
                                                        )}
                                                        {option === answer.selected_answer && option !== answer.question.correct_answer && (
                                                            <X className="h-4 w-4 text-red-500" />
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-between">
                            <Button variant="outline" asChild>
                                <Link href={`/quizzes/${quiz.id}`}>
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to Quiz
                                </Link>
                            </Button>
                            <Button asChild>
                                <Link href={`/quizzes/${quiz.id}/take`}>
                                    <GraduationCap className="mr-2 h-4 w-4" />
                                    Retake Quiz
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
