import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Check } from 'lucide-react';
import { FormEvent, useState } from 'react';

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
}

interface Props {
    quiz: Quiz;
    questions: QuizQuestion[];
}

export default function Take({ quiz, questions }: Props) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

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
            title: 'Take Quiz',
            href: `/quizzes/${quiz.id}/take`,
        },
    ];

    const { data, setData, post, processing } = useForm<{
        answers: Record<number, 'a' | 'b' | 'c' | 'd' | null>;
    }>({
        answers: questions.reduce((acc, question) => {
            acc[question.id] = null;
            return acc;
        }, {} as Record<number, 'a' | 'b' | 'c' | 'd' | null>),
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(`/quizzes/${quiz.id}/submit`);
    };

    const handleNext = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            setShowSubmitConfirm(true);
        }
    };

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    const question = questions[currentQuestion];
    const answeredCount = Object.values(data.answers).filter(Boolean).length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Take Quiz: ${quiz.title}`} />
            <div className="flex flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/quizzes/${quiz.id}`}>
                                <ArrowLeft className="mr-1 h-4 w-4" />
                                Back
                            </Link>
                        </Button>
                        <h1 className="text-2xl font-semibold">{quiz.title}</h1>
                    </div>
                </div>

                <div className="rounded-lg border">
                    <div className="border-b bg-gray-50 p-4 dark:bg-gray-900">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-medium">Question {currentQuestion + 1} of {questions.length}</h2>
                            <div className="text-sm text-gray-500">
                                {answeredCount} of {questions.length} answered
                            </div>
                        </div>
                        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                            <div
                                className="h-2 rounded-full bg-blue-500"
                                style={{ width: `${(answeredCount / questions.length) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                    <div className="p-4">
                        <form onSubmit={handleSubmit}>
                            <div className="mb-6">
                                <h3 className="mb-4 text-lg font-medium">{question.question}</h3>
                                <RadioGroup
                                    value={data.answers[question.id] || ''}
                                    onValueChange={(value) => {
                                        setData('answers', {
                                            ...data.answers,
                                            [question.id]: value as 'a' | 'b' | 'c' | 'd',
                                        });
                                    }}
                                    className="space-y-3"
                                >
                                    <div className="flex items-center space-x-2 rounded-md border p-3 hover:bg-gray-50 dark:hover:bg-gray-900">
                                        <RadioGroupItem value="a" id={`option-a-${question.id}`} />
                                        <Label htmlFor={`option-a-${question.id}`} className="flex-1 cursor-pointer">
                                            {question.option_a}
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2 rounded-md border p-3 hover:bg-gray-50 dark:hover:bg-gray-900">
                                        <RadioGroupItem value="b" id={`option-b-${question.id}`} />
                                        <Label htmlFor={`option-b-${question.id}`} className="flex-1 cursor-pointer">
                                            {question.option_b}
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2 rounded-md border p-3 hover:bg-gray-50 dark:hover:bg-gray-900">
                                        <RadioGroupItem value="c" id={`option-c-${question.id}`} />
                                        <Label htmlFor={`option-c-${question.id}`} className="flex-1 cursor-pointer">
                                            {question.option_c}
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2 rounded-md border p-3 hover:bg-gray-50 dark:hover:bg-gray-900">
                                        <RadioGroupItem value="d" id={`option-d-${question.id}`} />
                                        <Label htmlFor={`option-d-${question.id}`} className="flex-1 cursor-pointer">
                                            {question.option_d}
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            <div className="flex justify-between">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handlePrevious}
                                    disabled={currentQuestion === 0}
                                >
                                    Previous
                                </Button>
                                {currentQuestion < questions.length - 1 ? (
                                    <Button
                                        type="button"
                                        onClick={handleNext}
                                    >
                                        Next
                                    </Button>
                                ) : (
                                    <Button
                                        type="button"
                                        onClick={() => setShowSubmitConfirm(true)}
                                    >
                                        Finish
                                    </Button>
                                )}
                            </div>

                            {showSubmitConfirm && (
                                <div className="mt-6 rounded-lg border bg-gray-50 p-4 dark:bg-gray-900">
                                    <h3 className="mb-2 text-lg font-medium">Submit Quiz?</h3>
                                    <p className="mb-4 text-sm text-gray-500">
                                        You have answered {answeredCount} out of {questions.length} questions.
                                        {answeredCount < questions.length && ' You can go back to answer the remaining questions.'}
                                    </p>
                                    <div className="flex gap-2">
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                        >
                                            {processing ? (
                                                <>
                                                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                                                    Submitting...
                                                </>
                                            ) : (
                                                <>
                                                    <Check className="mr-2 h-4 w-4" />
                                                    Submit Quiz
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setShowSubmitConfirm(false)}
                                        >
                                            Continue Editing
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
