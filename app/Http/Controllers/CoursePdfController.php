<?php

namespace App\Http\Controllers;

use App\Models\CoursePdf;
use App\Services\CoursePdfService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CoursePdfController extends Controller
{
    protected $coursePdfService;

    public function __construct(CoursePdfService $coursePdfService)
    {
        $this->coursePdfService = $coursePdfService;
    }

    /**
     * Display a listing of available courses.
     */
    public function index(): Response
    {
        $courses = $this->coursePdfService->getAllCourses();
        $savedPdfs = auth()->user()->coursePdfs()->where('is_saved', true)->get();

        return Inertia::render('CoursePdfs/Index', [
            'courses' => $courses,
            'savedPdfs' => $savedPdfs,
            'message' => session('message'),
        ]);
    }

    /**
     * Display resources for a specific course.
     */
    public function show(int $courseId): Response
    {
        $resources = $this->coursePdfService->getCourseResources($courseId);
        $savedPdfIds = auth()->user()->coursePdfs()->where('is_saved', true)->pluck('pdf_url')->toArray();

        return Inertia::render('CoursePdfs/Show', [
            'courseId' => $courseId,
            'resources' => $resources,
            'savedPdfIds' => $savedPdfIds,
            'message' => session('message'),
        ]);
    }

    /**
     * Save a PDF to the user's account.
     */
    public function savePdf(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'course_id' => 'required|string',
            'pdf_url' => 'required|url',
        ]);

        // Check if this PDF is already saved
        $existingPdf = auth()->user()->coursePdfs()
            ->where('pdf_url', $request->pdf_url)
            ->where('is_saved', true)
            ->first();

        if ($existingPdf) {
            return redirect()->back()->with('message', 'This PDF is already saved to your account.');
        }

        // Generate a unique filename
        $filename = time() . '_' . Str::slug($request->title) . '.pdf';
        
        // Download the PDF and save it locally
        $localPath = $this->coursePdfService->downloadPdf($request->pdf_url, $filename);

        if (!$localPath) {
            return redirect()->back()->with('message', 'Failed to download the PDF. Please try again.');
        }

        // Save the PDF to the user's account
        CoursePdf::create([
            'user_id' => auth()->id(),
            'title' => $request->title,
            'course_id' => $request->course_id,
            'pdf_url' => $request->pdf_url,
            'local_path' => $localPath,
            'is_saved' => true,
            'metadata' => $request->metadata ?? null,
        ]);

        return redirect()->back()->with('message', 'PDF saved successfully to your account.');
    }

    /**
     * Remove a saved PDF from the user's account.
     */
    public function removeSavedPdf(CoursePdf $coursePdf)
    {
        // Ensure the user can only remove their own PDFs
        if ($coursePdf->user_id !== auth()->id()) {
            abort(403);
        }

        // Delete the local file if it exists
        if ($coursePdf->local_path && Storage::disk('public')->exists($coursePdf->local_path)) {
            Storage::disk('public')->delete($coursePdf->local_path);
        }

        // Delete the record
        $coursePdf->delete();

        return redirect()->back()->with('message', 'PDF removed from your account.');
    }

    /**
     * Get resources from a course URL with authentication.
     */
    public function getResourcesWithAuth(Request $request)
    {
        $request->validate([
            'url' => 'required|url',
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        $resources = $this->coursePdfService->getResourcesFromUrl(
            $request->url,
            $request->username,
            $request->password
        );

        if (empty($resources)) {
            return redirect()->back()->with('message', 'Failed to authenticate or no resources found.');
        }

        return redirect()->back()->with([
            'resources' => $resources,
            'message' => 'Authentication successful. Resources loaded.',
        ]);
    }

    /**
     * Display a listing of the user's saved PDFs.
     */
    public function savedPdfs(): Response
    {
        $savedPdfs = auth()->user()->coursePdfs()->where('is_saved', true)->get();

        return Inertia::render('CoursePdfs/Saved', [
            'savedPdfs' => $savedPdfs,
            'message' => session('message'),
        ]);
    }

    /**
     * View a specific saved PDF.
     */
    public function viewSavedPdf(CoursePdf $coursePdf): Response
    {
        // Ensure the user can only view their own PDFs
        if ($coursePdf->user_id !== auth()->id()) {
            abort(403);
        }

        return Inertia::render('CoursePdfs/View', [
            'pdf' => $coursePdf,
            'pdfUrl' => $coursePdf->local_path 
                ? Storage::disk('public')->url($coursePdf->local_path) 
                : $coursePdf->pdf_url,
        ]);
    }
}
