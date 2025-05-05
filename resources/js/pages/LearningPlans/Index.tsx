import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { BookOpen, FileText, GraduationCap, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface LearningResource {
  id: number;
  learning_plan_id: number;
  topic: string;
  description: string;
  resource_url: string | null;
  resource_type: string | null;
  priority: number;
  created_at: string;
}

interface LearningPlan {
  id: number;
  quiz_attempt_id: number;
  user_id: number;
  title: string;
  summary: string | null;
  roadmap: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  quiz_attempt: {
    id: number;
    quiz_id: number;
    score: number;
    total_questions: number;
  };
  resources: LearningResource[];
}

interface Props {
  learningPlans: LearningPlan[];
}

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
  },
  {
    title: 'Learning Plans',
    href: '/learning-plans',
  },
];

export default function Index({ learningPlans }: Props) {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Learning Plans" />

      <div className="container py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Learning Plans</h1>
        </div>

        {learningPlans.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
            <GraduationCap className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No learning plans yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Complete a quiz and generate a personalized learning plan to improve your knowledge.
            </p>
            <Link href="/quizzes">
              <Button>
                <GraduationCap className="mr-2 h-4 w-4" />
                Go to Quizzes
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {learningPlans.map((plan) => (
              <div
                key={plan.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      <BookOpen className="h-5 w-5 text-primary mr-2" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 truncate">
                        {plan.title}
                      </h3>
                    </div>
                    <Link
                      href={`/learning-plans/${plan.id}`}
                      method="delete"
                      as="button"
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Link>
                  </div>
                  <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Created {format(new Date(plan.created_at), 'PPP')}
                  </div>
                  <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Quiz Score: {plan.quiz_attempt.score}/{plan.quiz_attempt.total_questions}
                  </div>
                  <div className="mt-4 text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                    {plan.summary || 'No summary available.'}
                  </div>
                  <div className="mt-4">
                    <Link href={`/learning-plans/${plan.id}`}>
                      <Button variant="outline" className="w-full">
                        <FileText className="mr-2 h-4 w-4" />
                        View Learning Plan
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
