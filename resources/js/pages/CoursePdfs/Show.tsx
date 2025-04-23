import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, BookmarkPlus, ChevronDown, Download, ExternalLink, FileText, Filter, Lock, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Resource {
    title: string;
    url: string;
    type: string;
    requires_auth: boolean;
}

interface Props {
    courseId: string;
    resources: Resource[];
    savedPdfIds: string[];
    message?: string;
}

export default function Show({ courseId, resources, savedPdfIds, message }: Props) {
    const [selectedResources, setSelectedResources] = useState<string[]>([]);
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [filteredResources, setFilteredResources] = useState<Resource[]>(resources.filter(r => r.type.toLowerCase().includes('pdf')));
    const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
    const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
    const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        url: '',
        username: '',
        password: '',
    });

    const { data: saveData, setData: setSaveData, post: savePost, processing: saveProcessing } = useForm({
        title: '',
        course_id: courseId,
        pdf_url: '',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Course PDFs',
            href: '/course-pdfs',
        },
        {
            title: 'Course Details',
            href: `/course-pdfs/${courseId}`,
        },
    ];

    // Extract unique resource types
    const resourceTypes = [...new Set(resources.map(resource => resource.type.toUpperCase()))];

    // Apply filters when selections change
    useEffect(() => {
        let result = resources.filter(r => r.type.toLowerCase().includes('pdf'));

        // Filter by selected types if any
        if (selectedTypes.length > 0) {
            result = result.filter(resource => selectedTypes.includes(resource.type.toUpperCase()));
        }

        // Filter by selected resources if any
        if (selectedResources.length > 0) {
            result = result.filter(resource => selectedResources.includes(resource.url));
        }

        setFilteredResources(result);
    }, [selectedTypes, selectedResources, resources]);

    const handleSelectResource = (resourceUrl: string) => {
        setSelectedResources(prev =>
            prev.includes(resourceUrl) ? prev.filter(url => url !== resourceUrl) : [...prev, resourceUrl]
        );
    };

    const handleSelectAllResources = () => {
        if (selectedResources.length === filteredResources.length) {
            setSelectedResources([]);
        } else {
            setSelectedResources(filteredResources.map(resource => resource.url));
        }
    };

    const handleTypeChange = (type: string) => {
        setSelectedTypes(prev =>
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        );
    };

    const handleAuthSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/course-pdfs/auth', {
            onSuccess: () => {
                reset();
                setIsAuthDialogOpen(false);
            },
        });
    };

    const handleSaveSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        savePost('/course-pdfs/save', {
            onSuccess: () => {
                setSaveData({
                    title: '',
                    course_id: courseId,
                    pdf_url: '',
                });
                setIsSaveDialogOpen(false);
            },
        });
    };

    const handleResourceClick = (resource: Resource) => {
        if (resource.requires_auth) {
            setSelectedResource(resource);
            setData({
                url: resource.url,
                username: '',
                password: '',
            });
            setIsAuthDialogOpen(true);
        }
    };

    const handleSaveClick = (resource: Resource) => {
        setSelectedResource(resource);
        setSaveData({
            title: resource.title,
            course_id: courseId,
            pdf_url: resource.url,
        });
        setIsSaveDialogOpen(true);
    };

    const isPdfSaved = (url: string) => savedPdfIds.includes(url);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Course PDFs" />
            <div className="flex flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/course-pdfs">
                                <ArrowLeft className="mr-1 h-4 w-4" />
                                Back to Courses
                            </Link>
                        </Button>
                        <h1 className="text-2xl font-semibold">Course PDFs</h1>
                    </div>
                    {selectedResources.length > 0 && (
                        <Button variant="destructive" size="sm" onClick={() => setSelectedResources([])}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Clear Selection ({selectedResources.length})
                        </Button>
                    )}
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
                                Filter by Type
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56">
                            <DropdownMenuLabel>Resource Types</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {resourceTypes.map((type) => (
                                <DropdownMenuCheckboxItem
                                    key={type}
                                    checked={selectedTypes.includes(type)}
                                    onCheckedChange={() => handleTypeChange(type)}
                                >
                                    {type}
                                </DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button
                        variant="outline"
                        onClick={handleSelectAllResources}
                    >
                        {selectedResources.length === filteredResources.length && filteredResources.length > 0 ? 'Deselect All' : 'Select All'}
                    </Button>
                </div>

                {filteredResources.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
                        <FileText className="mb-4 h-12 w-12 text-gray-400" />
                        <h3 className="mb-2 text-lg font-medium">No PDFs found</h3>
                        <p className="mb-4 text-sm text-gray-500">
                            {selectedTypes.length > 0 || selectedResources.length > 0
                                ? 'No PDFs match your filter criteria. Try different filters.'
                                : 'There are no PDFs available for this course.'}
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {filteredResources.map((resource, index) => (
                            <Card
                                key={index}
                                className={`flex flex-col ${selectedResources.includes(resource.url) ? 'border-primary ring-1 ring-primary' : ''}`}
                            >
                                <CardHeader>
                                    <div className="flex items-start gap-2">
                                        <Checkbox
                                            id={`resource-${index}`}
                                            checked={selectedResources.includes(resource.url)}
                                            onCheckedChange={() => handleSelectResource(resource.url)}
                                            className="mt-1"
                                        />
                                        <div className="flex-1">
                                            <CardTitle className="line-clamp-2 flex items-center gap-2">
                                                <FileText className="h-5 w-5 flex-shrink-0 text-blue-500" />
                                                <span>{resource.title}</span>
                                                {resource.requires_auth && (
                                                    <Lock className="ml-auto h-4 w-4 flex-shrink-0 text-amber-500" />
                                                )}
                                            </CardTitle>
                                            <CardDescription className="line-clamp-1">
                                                {resource.type.toUpperCase()}
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="mt-auto flex flex-wrap gap-2">
                                    {resource.requires_auth ? (
                                        <Button onClick={() => handleResourceClick(resource)}>
                                            <Lock className="mr-2 h-4 w-4" />
                                            Authenticate
                                        </Button>
                                    ) : (
                                        <>
                                            <Button asChild>
                                                <a href={resource.url} target="_blank" rel="noopener noreferrer">
                                                    <ExternalLink className="mr-2 h-4 w-4" />
                                                    View
                                                </a>
                                            </Button>
                                            <Button variant="outline" asChild>
                                                <a href={resource.url} download target="_blank" rel="noopener noreferrer">
                                                    <Download className="mr-2 h-4 w-4" />
                                                    Download
                                                </a>
                                            </Button>
                                        </>
                                    )}
                                    {!isPdfSaved(resource.url) && (
                                        <Button
                                            variant="secondary"
                                            onClick={() => handleSaveClick(resource)}
                                            disabled={isPdfSaved(resource.url)}
                                        >
                                            <BookmarkPlus className="mr-2 h-4 w-4" />
                                            Save
                                        </Button>
                                    )}
                                    {isPdfSaved(resource.url) && (
                                        <Button variant="secondary" disabled>
                                            <BookmarkPlus className="mr-2 h-4 w-4" />
                                            Saved
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Authentication Dialog */}
                <Dialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Authentication Required</DialogTitle>
                            <DialogDescription>
                                This resource requires authentication. Please enter your credentials.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleAuthSubmit}>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="username">Username</Label>
                                    <Input
                                        id="username"
                                        value={data.username}
                                        onChange={(e) => setData('username', e.target.value)}
                                        required
                                    />
                                    {errors.username && <p className="text-sm text-red-500">{errors.username}</p>}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        required
                                    />
                                    {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsAuthDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Authenticating...' : 'Authenticate'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Save PDF Dialog */}
                <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Save PDF to Your Account</DialogTitle>
                            <DialogDescription>
                                This PDF will be saved to your account for future use.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSaveSubmit}>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="title">Title</Label>
                                    <Input
                                        id="title"
                                        value={saveData.title}
                                        onChange={(e) => setSaveData('title', e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsSaveDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={saveProcessing}>
                                    {saveProcessing ? 'Saving...' : 'Save PDF'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
