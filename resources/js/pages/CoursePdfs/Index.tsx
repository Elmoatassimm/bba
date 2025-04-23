import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { BookOpen, ChevronDown, ExternalLink, FileText, Filter, Plus, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Course {
    id: string;
    title: string;
    url: string;
    description?: string;
}

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
    courses: Course[];
    savedPdfs: SavedPdf[];
    message?: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Course PDFs',
        href: '/course-pdfs',
    },
];

export default function Index({ courses, savedPdfs, message }: Props) {
    const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [filteredCourses, setFilteredCourses] = useState<Course[]>(courses);

    // Extract unique categories from courses (for this example, we'll use the first word of the title as a category)
    const categories = [...new Set(courses.map(course => {
        const firstWord = course.title.split(' ')[0];
        return firstWord.length > 3 ? firstWord : 'Other';
    }))];

    // Apply filters when selections change
    useEffect(() => {
        let result = [...courses];

        // Filter by selected categories if any
        if (selectedCategories.length > 0) {
            result = result.filter(course => {
                const firstWord = course.title.split(' ')[0];
                const category = firstWord.length > 3 ? firstWord : 'Other';
                return selectedCategories.includes(category);
            });
        }

        // Filter by selected courses if any
        if (selectedCourses.length > 0) {
            result = result.filter(course => selectedCourses.includes(course.id));
        }

        setFilteredCourses(result);
    }, [selectedCategories, selectedCourses, courses]);

    const handleSelectCourse = (courseId: string) => {
        setSelectedCourses(prev =>
            prev.includes(courseId) ? prev.filter(id => id !== courseId) : [...prev, courseId]
        );
    };

    const handleSelectAllCourses = () => {
        if (selectedCourses.length === courses.length) {
            setSelectedCourses([]);
        } else {
            setSelectedCourses(courses.map(course => course.id));
        }
    };

    const handleCategoryChange = (category: string) => {
        setSelectedCategories(prev =>
            prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Course PDFs" />
            <div className="flex flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Course PDFs</h1>
                    <div className="flex gap-2">
                        {selectedCourses.length > 0 && (
                            <Button variant="destructive" size="sm" onClick={() => setSelectedCourses([])}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Clear Selection ({selectedCourses.length})
                            </Button>
                        )}
                        {savedPdfs.length > 0 && (
                            <Button asChild variant="outline">
                                <Link href="/course-pdfs/saved">
                                    <FileText className="mr-2 h-4 w-4" />
                                    View Saved PDFs ({savedPdfs.length})
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                {message && (
                    <div className="rounded-md bg-blue-50 p-4 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200">
                        {message}
                    </div>
                )}

                <div className="mb-4 flex flex-wrap gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="flex items-center gap-1">
                                <Filter className="h-4 w-4" />
                                Filter by Category
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56">
                            <DropdownMenuLabel>Categories</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {categories.map((category) => (
                                <DropdownMenuCheckboxItem
                                    key={category}
                                    checked={selectedCategories.includes(category)}
                                    onCheckedChange={() => handleCategoryChange(category)}
                                >
                                    {category}
                                </DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button
                        variant="outline"
                        onClick={handleSelectAllCourses}
                    >
                        {selectedCourses.length === courses.length ? 'Deselect All' : 'Select All'}
                    </Button>
                </div>

                {filteredCourses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
                        <BookOpen className="mb-4 h-12 w-12 text-gray-400" />
                        <h3 className="mb-2 text-lg font-medium">No courses found</h3>
                        <p className="mb-4 text-sm text-gray-500">
                            {selectedCategories.length > 0 || selectedCourses.length > 0
                                ? 'No courses match your filter criteria. Try different filters.'
                                : 'There are no courses available at the moment.'}
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {filteredCourses.map((course) => (
                            <Card
                                key={course.id}
                                className={`flex flex-col ${selectedCourses.includes(course.id) ? 'border-primary ring-1 ring-primary' : ''}`}
                            >
                                <CardHeader>
                                    <div className="flex items-start gap-2">
                                        <Checkbox
                                            id={`course-${course.id}`}
                                            checked={selectedCourses.includes(course.id)}
                                            onCheckedChange={() => handleSelectCourse(course.id)}
                                            className="mt-1"
                                        />
                                        <div className="flex-1">
                                            <CardTitle className="line-clamp-1">{course.title}</CardTitle>
                                            {course.description && (
                                                <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="mt-auto flex justify-between">
                                    <Button asChild>
                                        <Link href={`/course-pdfs/${course.id}`}>
                                            <FileText className="mr-2 h-4 w-4" />
                                            View PDFs
                                        </Link>
                                    </Button>
                                    <Button variant="outline" asChild>
                                        <a href={course.url} target="_blank" rel="noopener noreferrer">
                                            <ExternalLink className="mr-2 h-4 w-4" />
                                            Original
                                        </a>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
