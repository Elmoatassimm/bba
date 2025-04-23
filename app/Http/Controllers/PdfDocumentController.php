<?php

namespace App\Http\Controllers;

use App\Models\PdfDocument;
use App\Services\AI\AIServiceInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class PdfDocumentController extends Controller
{
    /**
     * Display a listing of the PDF documents.
     */
    public function index(): Response
    {
        $documents = auth()->user()->pdfDocuments()->latest()->get();

        return Inertia::render('PdfDocuments/Index', [
            'documents' => $documents,
            'message' => session('message'),
            'newDocumentId' => session('newDocumentId'),
        ]);
    }

    /**
     * Show the form for creating a new PDF document.
     */
    public function create(): Response
    {
        return Inertia::render('PdfDocuments/Create');
    }

    /**
     * Store a newly created PDF document in storage.
     */
    public function store(Request $request, AIServiceInterface $aiService)
    {
        $request->validate([
            'pdf_file' => 'required|file|mimes:pdf|max:10240', // 10MB max
            'title' => 'required|string|max:255',
        ]);

        $file = $request->file('pdf_file');
        $filename = time() . '_' . $file->getClientOriginalName();
        $path = $file->storeAs('pdfs', $filename, 'public');

        $document = PdfDocument::create([
            'user_id' => auth()->id(),
            'title' => $request->title,
            'filename' => $filename,
            'file_path' => $path,
            'status' => 'processing',
        ]);

        // In a real application, this would be a background job
        // For now, we'll simulate a background job by processing immediately
        // but in a production app, you would use Laravel's queue system
        try {
            // Process the document immediately for demo purposes
            // In a real app, this would be dispatched to a queue
            $summary = $aiService->summarizePdf(Storage::disk('public')->path($path));
            $document->update([
                'summary' => $summary,
                'status' => 'completed',
            ]);
        } catch (\Exception $e) {
            // Log the error in a real application
            // In a production app, you would log the exception details
            // Log::error('PDF processing failed: ' . $e->getMessage(), ['exception' => $e]);
            $document->update([
                'summary' => 'Error processing document: ' . $e->getMessage(),
                'status' => 'failed',
            ]);
        }

        return redirect()->route('pdf-documents.index')
            ->with('message', 'PDF uploaded and processed successfully.')
            ->with('newDocumentId', $document->id);
    }

    /**
     * Display the specified PDF document.
     */
    public function show(PdfDocument $pdfDocument): Response
    {
        // Ensure the user can only view their own documents
        if ($pdfDocument->user_id !== auth()->id()) {
            abort(403);
        }

        return Inertia::render('PdfDocuments/Show', [
            'document' => $pdfDocument,
            'pdfUrl' => Storage::disk('public')->url($pdfDocument->file_path),
        ]);
    }

    /**
     * Reprocess an existing PDF document with AI.
     */
    public function reprocess(PdfDocument $pdfDocument, AIServiceInterface $aiService)
    {
        // Ensure the user can only reprocess their own documents
        if ($pdfDocument->user_id !== auth()->id()) {
            abort(403);
        }

        // Update status to processing
        $pdfDocument->update([
            'status' => 'processing',
        ]);

        try {
            // Process the document
            $summary = $aiService->summarizePdf(Storage::disk('public')->path($pdfDocument->file_path));
            $pdfDocument->update([
                'summary' => $summary,
                'status' => 'completed',
            ]);

            return redirect()->route('pdf-documents.show', $pdfDocument)
                ->with('message', 'Document reprocessed successfully.');
        } catch (\Exception $e) {
            // Log the error in a real application
            // In a production app, you would log the exception details
            // Log::error('PDF reprocessing failed: ' . $e->getMessage(), ['exception' => $e]);

            $pdfDocument->update([
                'summary' => 'Error processing document: ' . $e->getMessage(),
                'status' => 'failed',
            ]);

            return redirect()->route('pdf-documents.show', $pdfDocument)
                ->with('error', 'Failed to reprocess document.');
        }
    }

    /**
     * Delete a PDF document.
     */
    public function destroy(PdfDocument $pdfDocument)
    {
        // Ensure the user can only delete their own documents
        if ($pdfDocument->user_id !== auth()->id()) {
            abort(403);
        }

        // Delete the file from storage
        Storage::disk('public')->delete($pdfDocument->file_path);

        // Delete the database record
        $pdfDocument->delete();

        return redirect()->route('pdf-documents.index')
            ->with('message', 'Document deleted successfully.');
    }
}
