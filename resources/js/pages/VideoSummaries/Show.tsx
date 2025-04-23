import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Bookmark, BookmarkCheck, ExternalLink, MoreVertical, Trash2, Youtube } from 'lucide-react';

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
    videoSummary: VideoSummary;
    message?: string;
}

export default function Show({ videoSummary, message }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Video Summaries',
            href: '/video-summaries',
        },
        {
            title: videoSummary.title,
            href: `/video-summaries/${videoSummary.id}`,
        },
    ];

    const toggleSave = () => {
        router.post(`/video-summaries/${videoSummary.id}/toggle-save`);
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this video summary?')) {
            router.delete(`/video-summaries/${videoSummary.id}`);
        }
    };

    const getYouTubeEmbedUrl = (videoId: string) => {
        return `https://www.youtube.com/embed/${videoId}`;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={videoSummary.title} />
            <div className="p-4">
                {message && (
                    <div className="mb-4 rounded-md bg-green-50 p-4 text-green-700 dark:bg-green-900 dark:text-green-100">
                        {message}
                    </div>
                )}

                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/video-summaries">
                                <ArrowLeft className="mr-1 h-4 w-4" />
                                Back to Summaries
                            </Link>
                        </Button>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={toggleSave}
                            className={videoSummary.saved_for_later ? 'text-yellow-600' : ''}
                        >
                            {videoSummary.saved_for_later ? (
                                <>
                                    <BookmarkCheck className="mr-1 h-4 w-4" />
                                    Saved
                                </>
                            ) : (
                                <>
                                    <Bookmark className="mr-1 h-4 w-4" />
                                    Save for Later
                                </>
                            )}
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                    <a href={videoSummary.video_url} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="mr-2 h-4 w-4" />
                                        Open in YouTube
                                    </a>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Summary
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <div className="mb-6">
                    <h1 className="text-2xl font-semibold">{videoSummary.title}</h1>
                    <div className="mt-1 flex items-center text-sm text-gray-500">
                        <Youtube className="mr-1 h-4 w-4 text-red-600" />
                        <a
                            href={videoSummary.video_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-blue-600 hover:underline"
                        >
                            {videoSummary.video_url}
                        </a>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <div className="flex flex-col gap-4">
                        <div className="rounded-lg border">
                            <div className="border-b bg-gray-50 p-4 dark:bg-gray-900">
                                <h2 className="text-lg font-medium">Video</h2>
                            </div>
                            <div className="aspect-video p-4">
                                <iframe
                                    src={getYouTubeEmbedUrl(videoSummary.video_id)}
                                    title={videoSummary.title}
                                    className="h-full w-full rounded-md"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="rounded-lg border">
                            <div className="border-b bg-gray-50 p-4 dark:bg-gray-900">
                                <h2 className="text-lg font-medium">Summary</h2>
                            </div>
                            <div className="p-4">
                                {videoSummary.status === 'completed' ? (
                                    <p className="whitespace-pre-line text-sm">{videoSummary.summary}</p>
                                ) : videoSummary.status === 'processing' ? (
                                    <div className="flex items-center justify-center p-4 text-gray-500">
                                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                                        Processing video...
                                    </div>
                                ) : videoSummary.status === 'failed' ? (
                                    <p className="text-sm text-red-500">{videoSummary.summary || 'Failed to generate summary'}</p>
                                ) : (
                                    <p className="text-sm text-gray-500">Waiting to process...</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {videoSummary.status === 'completed' && (
                    <div className="mt-6 grid gap-6 md:grid-cols-2">
                        <div className="rounded-lg border">
                            <div className="border-b bg-gray-50 p-4 dark:bg-gray-900">
                                <h2 className="text-lg font-medium">Key Points</h2>
                            </div>
                            <div className="p-4">
                                {videoSummary.key_points && videoSummary.key_points.length > 0 ? (
                                    <ul className="list-inside list-disc space-y-2">
                                        {videoSummary.key_points.map((point, index) => (
                                            <li key={index} className="text-sm">
                                                {point}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-gray-500">No key points available</p>
                                )}
                            </div>
                        </div>

                        <div className="rounded-lg border">
                            <div className="border-b bg-gray-50 p-4 dark:bg-gray-900">
                                <h2 className="text-lg font-medium">Actionable Takeaways</h2>
                            </div>
                            <div className="p-4">
                                {videoSummary.actionable_takeaways && videoSummary.actionable_takeaways.length > 0 ? (
                                    <ul className="list-inside list-disc space-y-2">
                                        {videoSummary.actionable_takeaways.map((takeaway, index) => (
                                            <li key={index} className="text-sm">
                                                {takeaway}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-gray-500">No actionable takeaways available</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
