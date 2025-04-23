<?php

use App\Http\Controllers\CoursePdfController;
use App\Http\Controllers\PdfDocumentController;
use App\Http\Controllers\QuizController;
use App\Http\Controllers\VideoSummaryController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // PDF Document routes
    Route::resource('pdf-documents', PdfDocumentController::class);
    Route::post('pdf-documents/{pdf_document}/reprocess', [PdfDocumentController::class, 'reprocess'])->name('pdf-documents.reprocess');
    Route::post('pdf-documents/{pdf_document}/diagrams', [PdfDocumentController::class, 'generateDiagram'])->name('pdf-documents.diagrams');

    // Quiz routes
    Route::get('quizzes', [QuizController::class, 'index'])->name('quizzes.index');
    Route::get('pdf-documents/{pdfDocument}/quizzes/create', [QuizController::class, 'create'])->name('quizzes.create');
    Route::post('pdf-documents/{pdfDocument}/quizzes', [QuizController::class, 'store'])->name('quizzes.store');
    Route::get('quizzes/{quiz}', [QuizController::class, 'show'])->name('quizzes.show');
    Route::get('quizzes/{quiz}/take', [QuizController::class, 'start'])->name('quizzes.take');
    Route::post('quizzes/{quiz}/submit', [QuizController::class, 'submit'])->name('quizzes.submit');
    Route::get('quiz-attempts/{quizAttempt}/results', [QuizController::class, 'results'])->name('quizzes.results');

    // Video Summary routes
    Route::resource('video-summaries', VideoSummaryController::class);
    Route::post('video-summaries/{videoSummary}/toggle-save', [VideoSummaryController::class, 'toggleSave'])->name('video-summaries.toggle-save');

    // Course PDF routes
    Route::get('course-pdfs', [CoursePdfController::class, 'index'])->name('course-pdfs.index');
    Route::get('course-pdfs/saved', [CoursePdfController::class, 'savedPdfs'])->name('course-pdfs.saved');
    Route::get('course-pdfs/{courseId}', [CoursePdfController::class, 'show'])->name('course-pdfs.show');
    Route::post('course-pdfs/save', [CoursePdfController::class, 'savePdf'])->name('course-pdfs.save');
    Route::delete('course-pdfs/{coursePdf}', [CoursePdfController::class, 'removeSavedPdf'])->name('course-pdfs.remove');
    Route::get('course-pdfs/view/{coursePdf}', [CoursePdfController::class, 'viewSavedPdf'])->name('course-pdfs.view');
    Route::post('course-pdfs/auth', [CoursePdfController::class, 'getResourcesWithAuth'])->name('course-pdfs.auth');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
