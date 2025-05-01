import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { StatisticsCard } from '@/components/ui/statistics-card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { BookOpen, FileText, GraduationCap, Youtube, BarChart3, PieChart, LineChart, Users, FileUp, Brain, FileQuestion } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RePieChart, Pie, Cell, LineChart as ReLineChart, Line } from 'recharts';

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

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <StatisticsCard
                        title="Total Documents"
                        value="42"
                        description="PDF documents processed"
                        icon={<FileText className="h-4 w-4" />}
                        trend={{ value: 12, isPositive: true }}
                    />
                    <StatisticsCard
                        title="Active Users"
                        value="18"
                        description="Users this month"
                        icon={<Users className="h-4 w-4" />}
                        trend={{ value: 8, isPositive: true }}
                    />
                    <StatisticsCard
                        title="Uploads"
                        value="156"
                        description="Total uploads"
                        icon={<FileUp className="h-4 w-4" />}
                        trend={{ value: 5, isPositive: true }}
                    />
                    <StatisticsCard
                        title="AI Summaries"
                        value="87"
                        description="Documents summarized"
                        icon={<Brain className="h-4 w-4" />}
                        trend={{ value: 24, isPositive: true }}
                    />
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="col-span-1 lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Document Processing Activity</CardTitle>
                            <CardDescription>Number of documents processed over time</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <ReLineChart
                                    data={[
                                        { name: 'Jan', documents: 4 },
                                        { name: 'Feb', documents: 7 },
                                        { name: 'Mar', documents: 5 },
                                        { name: 'Apr', documents: 10 },
                                        { name: 'May', documents: 8 },
                                        { name: 'Jun', documents: 12 },
                                        { name: 'Jul', documents: 16 },
                                    ]}
                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="documents" stroke="#F53003" activeDot={{ r: 8 }} />
                                </ReLineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Document Types</CardTitle>
                            <CardDescription>Distribution by category</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <RePieChart>
                                    <Pie
                                        data={[
                                            { name: 'Course Materials', value: 45 },
                                            { name: 'Research Papers', value: 25 },
                                            { name: 'Notes', value: 20 },
                                            { name: 'Other', value: 10 },
                                        ]}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        <Cell fill="#F53003" />
                                        <Cell fill="#F8B803" />
                                        <Cell fill="#F0ACB8" />
                                        <Cell fill="#F3BEC7" />
                                    </Pie>
                                    <Tooltip />
                                </RePieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>Quiz Performance</CardTitle>
                            <CardDescription>Average scores by quiz category</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={[
                                        { category: 'Computer Science', score: 85 },
                                        { category: 'Mathematics', score: 78 },
                                        { category: 'Physics', score: 72 },
                                        { category: 'Literature', score: 90 },
                                        { category: 'History', score: 82 },
                                    ]}
                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="category" />
                                    <YAxis domain={[0, 100]} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="score" fill="#F53003" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                <div className="mt-6">
                    <h2 className="mb-4 text-xl font-semibold">Recent Activity</h2>
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[30vh] overflow-hidden rounded-xl border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
