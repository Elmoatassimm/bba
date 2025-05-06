<?php

namespace App\Http\Controllers;

use App\Services\AI\AIServiceInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class TextExplanationController extends Controller
{
    /**
     * Generate an explanation for selected text.
     *
     * @param Request $request
     * @param AIServiceInterface $aiService
     * @return \Illuminate\Http\JsonResponse
     */
    public function explain(Request $request, AIServiceInterface $aiService)
    {
        try {
            // Validate the request
            $validated = $request->validate([
                'selected_text' => 'required|string|min:5|max:5000',
                'document_id' => 'nullable|integer|exists:pdf_documents,id',
            ]);

            $selectedText = $request->input('selected_text');
            $documentId = $request->input('document_id');
            $filePath = null;

            // Log the request for debugging
            Log::info('Text explanation request received', [
                'text_length' => strlen($selectedText),
                'document_id' => $documentId,
                'user_id' => $request->user() ? $request->user()->id : 'guest'
            ]);

            // If document_id is provided, get the file path
            if ($documentId) {
                $document = \App\Models\PdfDocument::find($documentId);
                if ($document) {
                    $filePath = Storage::disk('public')->path($document->file_path);
                    Log::info('Using document for context', ['document_title' => $document->title]);
                }
            }

            // Generate the explanation
            $explanation = $aiService->explainSelectedText($selectedText, $filePath);

            // Log success
            Log::info('Text explanation generated successfully', [
                'explanation_length' => strlen($explanation)
            ]);

            return response()->json([
                'success' => true,
                'explanation' => $explanation
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            // Handle validation errors
            Log::warning('Validation error in text explanation request', [
                'errors' => $e->errors()
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Invalid input: ' . implode(', ', array_map(function($errors) {
                    return implode(', ', $errors);
                }, $e->errors())),
                'validation_errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            // Handle other exceptions
            Log::error('Error generating text explanation', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Failed to generate explanation: ' . $e->getMessage()
            ], 500);
        }
    }
}
