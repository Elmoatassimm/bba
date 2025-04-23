<?php

namespace App\Http\Controllers;

use App\Models\VideoSummary;
use App\Services\AI\AIServiceInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class VideoSummaryController extends Controller
{
    /**
     * Display a listing of the video summaries.
     */
    public function index(): Response
    {
        $videoSummaries = auth()->user()->videoSummaries()->orderBy('created_at', 'desc')->get();

        return Inertia::render('VideoSummaries/Index', [
            'videoSummaries' => $videoSummaries,
        ]);
    }

    /**
     * Show the form for creating a new video summary.
     */
    public function create(): Response
    {
        return Inertia::render('VideoSummaries/Create');
    }

    /**
     * Store a newly created video summary in storage.
     */
    public function store(Request $request, AIServiceInterface $aiService)
    {
        $request->validate([
            'video_url' => 'required|url',
            'title' => 'required|string|max:255',
        ]);

        // Extract video ID from URL
        $videoId = $this->extractYouTubeVideoId($request->video_url);
        
        if (!$videoId) {
            return redirect()->back()->withErrors([
                'video_url' => 'Invalid YouTube URL. Please provide a valid YouTube video URL.',
            ]);
        }

        // Create a new video summary record
        $videoSummary = VideoSummary::create([
            'user_id' => auth()->id(),
            'title' => $request->title,
            'video_url' => $request->video_url,
            'video_id' => $videoId,
            'status' => 'processing',
        ]);

        try {
            // Process the video immediately for demo purposes
            // In a real app, this would be dispatched to a queue
            $result = $aiService->summarizeYouTubeVideo($request->video_url);
            
            $videoSummary->update([
                'summary' => $result['summary'],
                'key_points' => json_encode($result['key_points']),
                'actionable_takeaways' => json_encode($result['actionable_takeaways']),
                'status' => 'completed',
            ]);

            return redirect()->route('video-summaries.show', $videoSummary)
                ->with('message', 'Video summarized successfully.');
        } catch (\Exception $e) {
            // Log the error
            Log::error('Error summarizing video: ' . $e->getMessage());

            $videoSummary->update([
                'summary' => 'Error processing video: ' . $e->getMessage(),
                'status' => 'failed',
            ]);

            return redirect()->route('video-summaries.index')
                ->with('error', 'Failed to summarize video. Please try again later.');
        }
    }

    /**
     * Display the specified video summary.
     */
    public function show(VideoSummary $videoSummary): Response
    {
        // Ensure the user can only view their own video summaries
        if ($videoSummary->user_id !== auth()->id()) {
            abort(403);
        }

        // Decode the JSON fields
        $videoSummary->key_points = json_decode($videoSummary->key_points);
        $videoSummary->actionable_takeaways = json_decode($videoSummary->actionable_takeaways);

        return Inertia::render('VideoSummaries/Show', [
            'videoSummary' => $videoSummary,
        ]);
    }

    /**
     * Toggle the saved_for_later status of the video summary.
     */
    public function toggleSave(VideoSummary $videoSummary)
    {
        // Ensure the user can only modify their own video summaries
        if ($videoSummary->user_id !== auth()->id()) {
            abort(403);
        }

        $videoSummary->update([
            'saved_for_later' => !$videoSummary->saved_for_later,
        ]);

        return redirect()->back()
            ->with('message', $videoSummary->saved_for_later ? 'Video summary saved for later.' : 'Video summary removed from saved items.');
    }

    /**
     * Remove the specified video summary from storage.
     */
    public function destroy(VideoSummary $videoSummary)
    {
        // Ensure the user can only delete their own video summaries
        if ($videoSummary->user_id !== auth()->id()) {
            abort(403);
        }

        $videoSummary->delete();

        return redirect()->route('video-summaries.index')
            ->with('message', 'Video summary deleted successfully.');
    }

    /**
     * Extract the YouTube video ID from a URL
     *
     * @param string $url The YouTube video URL
     * @return string|null The video ID or null if not found
     */
    private function extractYouTubeVideoId(string $url): ?string
    {
        // Regular expression to match YouTube video IDs from various URL formats
        $pattern = '/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i';
        
        if (preg_match($pattern, $url, $matches)) {
            return $matches[1];
        }
        
        return null;
    }
}
