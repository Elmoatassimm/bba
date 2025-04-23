import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, Youtube } from 'lucide-react';
import { FormEvent } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Video Summaries',
        href: '/video-summaries',
    },
    {
        title: 'New Summary',
        href: '/video-summaries/create',
    },
];

export default function Create() {
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        video_url: '',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/video-summaries');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Video Summary" />
            <div className="mx-auto max-w-2xl p-4">
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold">Create Video Summary</h1>
                    <p className="text-gray-500">
                        Enter a YouTube video URL to generate a concise summary of the video's main points and key takeaways.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="title">Summary Title</Label>
                        <Input
                            id="title"
                            type="text"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            placeholder="Enter a title for this summary"
                            required
                        />
                        {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="video_url">YouTube Video URL</Label>
                        <div className="flex items-center space-x-2">
                            <Youtube className="h-5 w-5 text-red-600" />
                            <Input
                                id="video_url"
                                type="url"
                                value={data.video_url}
                                onChange={(e) => setData('video_url', e.target.value)}
                                placeholder="https://www.youtube.com/watch?v=..."
                                required
                            />
                        </div>
                        {errors.video_url && <p className="text-sm text-red-500">{errors.video_url}</p>}
                        <p className="text-xs text-gray-500">
                            Paste a valid YouTube video URL. The AI will analyze the video and generate a summary.
                        </p>
                    </div>

                    <div className="flex justify-between">
                        <Button type="button" variant="outline" onClick={() => window.history.back()}>
                            <ArrowLeft className="mr-1 h-4 w-4" />
                            Back
                        </Button>
                        <Button type="submit" disabled={processing || !data.title || !data.video_url}>
                            {processing ? (
                                <>
                                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                                    Processing...
                                </>
                            ) : (
                                'Generate Summary'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
