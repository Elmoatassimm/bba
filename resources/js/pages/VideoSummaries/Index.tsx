import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ChevronDown, MoreVertical, Plus, Trash2, Youtube, Bookmark, BookmarkCheck } from 'lucide-react';
import { useState } from 'react';

interface VideoSummary {
    id: number;
    title: string;
    video_url: string;
    video_id: string;
    summary: string | null;
    key_points: string[] | null;
    actionable_takeaways: string[] | null;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    saved_for_later: boolean;
    created_at: string;
}

interface Props {
    videoSummaries: VideoSummary[];
    message?: string;
    error?: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Video Summaries',
        href: '/video-summaries',
    },
];

export default function Index({ videoSummaries, message, error }: Props) {
    const [selectedSummaries, setSelectedSummaries] = useState<number[]>([]);

    const handleSelectSummary = (id: number) => {
        setSelectedSummaries(prev =>
            prev.includes(id) ? prev.filter(summaryId => summaryId !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (selectedSummaries.length === videoSummaries.length) {
            setSelectedSummaries([]);
        } else {
            setSelectedSummaries(videoSummaries.map(summary => summary.id));
        }
    };

    const handleDeleteSelected = () => {
        if (confirm(`Are you sure you want to delete ${selectedSummaries.length} selected video summaries?`)) {
            selectedSummaries.forEach(id => {
                router.delete(`/video-summaries/${id}`);
            });
            setSelectedSummaries([]);
        }
    };

    const toggleSave = (id: number) => {
        router.post(`/video-summaries/${id}/toggle-save`);
    };

    const getYouTubeThumbnailUrl = (videoId: string) => {
        return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Video Summaries" />
            <div className="p-4">
                {message && (
                    <div className="mb-4 rounded-md bg-green-50 p-4 text-green-700 dark:bg-green-900 dark:text-green-100">
                        {message}
                    </div>
                )}
                {error && (
                    <div className="mb-4 rounded-md bg-red-50 p-4 text-red-700 dark:bg-red-900 dark:text-red-100">
                        {error}
                    </div>
                )}

                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Video Summaries</h1>
                    <div className="flex space-x-2">
                        {selectedSummaries.length > 0 && (
                            <Button variant="outline" size="sm" onClick={handleDeleteSelected}>
                                <Trash2 className="mr-1 h-4 w-4" />
                                Delete Selected
                            </Button>
                        )}
                        <Button asChild>
                            <Link href="/video-summaries/create">
                                <Plus className="mr-1 h-4 w-4" />
                                New Video Summary
                            </Link>
                        </Button>
                    </div>
                </div>

                {videoSummaries.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
                        <Youtube className="mb-4 h-12 w-12 text-gray-400" />
                        <h3 className="mb-2 text-lg font-medium">No video summaries yet</h3>
                        <p className="mb-4 text-sm text-gray-500">
                            Get started by creating a new video summary from a YouTube video.
                        </p>
                        <Button asChild>
                            <Link href="/video-summaries/create">
                                <Plus className="mr-1 h-4 w-4" />
                                New Video Summary
                            </Link>
                        </Button>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-lg border">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th scope="col" className="w-12 px-4 py-3 text-left">
                                        <Checkbox
                                            checked={
                                                videoSummaries.length > 0 &&
                                                selectedSummaries.length === videoSummaries.length
                                            }
                                            onCheckedChange={handleSelectAll}
                                            aria-label="Select all"
                                        />
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Video
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Title
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Status
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Created
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Saved
                                    </th>
                                    <th scope="col" className="w-10 px-4 py-3 text-right">
                                        <span className="sr-only">Actions</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                                {videoSummaries.map((summary) => (
                                    <tr key={summary.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                        <td className="px-4 py-3 text-sm">
                                            <Checkbox
                                                checked={selectedSummaries.includes(summary.id)}
                                                onCheckedChange={() => handleSelectSummary(summary.id)}
                                                aria-label={`Select ${summary.title}`}
                                            />
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            <a href={summary.video_url} target="_blank" rel="noopener noreferrer" className="block w-24">
                                                <img 
                                                    src={getYouTubeThumbnailUrl(summary.video_id)} 
                                                    alt={summary.title}
                                                    className="rounded-md"
                                                />
                                            </a>
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            <Link
                                                href={`/video-summaries/${summary.id}`}
                                                className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                            >
                                                {summary.title}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            <span
                                                className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                                                    summary.status === 'completed'
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                        : summary.status === 'processing'
                                                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                                        : summary.status === 'failed'
                                                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                }`}
                                            >
                                                {summary.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(summary.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            <button
                                                onClick={() => toggleSave(summary.id)}
                                                className="text-gray-500 hover:text-yellow-500 dark:text-gray-400 dark:hover:text-yellow-400"
                                                aria-label={summary.saved_for_later ? "Unsave" : "Save for later"}
                                            >
                                                {summary.saved_for_later ? (
                                                    <BookmarkCheck className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
                                                ) : (
                                                    <Bookmark className="h-5 w-5" />
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm font-medium">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/video-summaries/${summary.id}`}>View</Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            if (confirm('Are you sure you want to delete this video summary?')) {
                                                                router.delete(`/video-summaries/${summary.id}`);
                                                            }
                                                        }}
                                                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                                    >
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
