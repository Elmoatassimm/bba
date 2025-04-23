<?php

use App\Http\Controllers\PdfDocumentController;
use App\Http\Controllers\QuizController;
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

    // Quiz routes
    Route::get('quizzes', [QuizController::class, 'index'])->name('quizzes.index');
    Route::get('pdf-documents/{pdfDocument}/quizzes/create', [QuizController::class, 'create'])->name('quizzes.create');
    Route::post('pdf-documents/{pdfDocument}/quizzes', [QuizController::class, 'store'])->name('quizzes.store');
    Route::get('quizzes/{quiz}', [QuizController::class, 'show'])->name('quizzes.show');
    Route::get('quizzes/{quiz}/take', [QuizController::class, 'start'])->name('quizzes.take');
    Route::post('quizzes/{quiz}/submit', [QuizController::class, 'submit'])->name('quizzes.submit');
    Route::get('quiz-attempts/{quizAttempt}/results', [QuizController::class, 'results'])->name('quizzes.results');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
