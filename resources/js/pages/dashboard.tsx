import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { BookOpen, FileText, GraduationCap, Youtube } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <h1 className="text-2xl font-semibold">Dashboard</h1>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>PDF Documents</CardTitle>
                            <CardDescription>Manage your uploaded PDF documents</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button asChild className="w-full">
                                <Link href="/pdf-documents">
                                    <FileText className="mr-2 h-4 w-4" />
                                    View Documents
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Course PDFs</CardTitle>
                            <CardDescription>Browse and save course PDFs</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button asChild className="w-full">
                                <Link href="/course-pdfs">
                                    <BookOpen className="mr-2 h-4 w-4" />
                                    Browse Courses
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Quizzes</CardTitle>
                            <CardDescription>Create and take quizzes from your documents</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button asChild className="w-full">
                                <Link href="/quizzes">
                                    <GraduationCap className="mr-2 h-4 w-4" />
                                    View Quizzes
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Video Summaries</CardTitle>
                            <CardDescription>Summarize YouTube videos</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button asChild className="w-full">
                                <Link href="/video-summaries">
                                    <Youtube className="mr-2 h-4 w-4" />
                                    View Summaries
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <div className="mt-6">
                    <h2 className="mb-4 text-xl font-semibold">Recent Activity</h2>
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[40vh] overflow-hidden rounded-xl border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
