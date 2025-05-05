<?php

namespace App\Http\Controllers;

use App\Models\PdfDocument;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\QuizQuestion;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Services\AI\AIServiceInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class QuizController extends Controller
{
    /**
     * Display a listing of the quizzes.
     */
    public function index(): Response
    {
        // Get all quizzes for the user's documents with the pdf_document relationship eager loaded
        $quizzes = Quiz::whereHas('pdfDocument', function ($query) {
            $query->where('user_id', Auth::id());
        })
            ->with('pdfDocument') // Eager load the pdf_document relationship
            ->latest()
            ->get();

        return Inertia::render('Quizzes/Index', [
            'quizzes' => $quizzes,
        ]);
    }

    /**
     * Show the form for creating a new quiz.
     */
    public function create(PdfDocument $pdfDocument): Response
    {
        // Ensure the user can only create quizzes for their own documents
        if ($pdfDocument->user_id !== Auth::id()) {
            abort(403);
        }

        return Inertia::render('Quizzes/Create', [
            'document' => $pdfDocument,
        ]);
    }

    /**
     * Store a newly created quiz in storage.
     */
    public function store(Request $request, PdfDocument $pdfDocument, AIServiceInterface $aiService)
    {
        // Ensure the user can only create quizzes for their own documents
        if ($pdfDocument->user_id !== Auth::id()) {
            abort(403);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'num_questions' => 'required|integer|min:1|max:20',
        ]);

        $quiz = Quiz::create([
            'pdf_document_id' => $pdfDocument->id,
            'title' => $request->title,
            'num_questions' => $request->num_questions,
            'status' => 'processing',
        ]);

        // In a real application, this would be a background job
        // For now, we'll simulate a background job by processing immediately
        try {
            // Generate quiz questions
            $questions = $aiService->generateQuiz(
                Storage::disk('public')->path($pdfDocument->file_path),
                $request->num_questions
            );

            // Save the questions
            foreach ($questions as $questionData) {
                QuizQuestion::create([
                    'quiz_id' => $quiz->id,
                    'question' => $questionData['question'],
                    'option_a' => $questionData['option_a'],
                    'option_b' => $questionData['option_b'],
                    'option_c' => $questionData['option_c'],
                    'option_d' => $questionData['option_d'],
                    'correct_answer' => $questionData['correct_answer'],
                ]);
            }

            // Update quiz status
            $quiz->update([
                'status' => 'completed',
            ]);
        } catch (\Exception $e) {
            // Log the error
            Log::error('Error generating quiz: ' . $e->getMessage());

            // Update quiz status to failed
            $quiz->update([
                'status' => 'failed',
            ]);
        }

        return redirect()->route('quizzes.show', $quiz->id)
            ->with('message', 'Quiz created successfully.');
    }

    /**
     * Display the specified quiz.
     */
    public function show(Quiz $quiz): Response
    {
        // Ensure the user can only view quizzes for their own documents
        if ($quiz->pdfDocument->user_id !== Auth::id()) {
            abort(403);
        }

        // Load the quiz with its questions and document
        $quiz->load(['questions', 'pdfDocument']);

        return Inertia::render('Quizzes/Show', [
            'quiz' => $quiz,
            'document' => $quiz->pdfDocument,
        ]);
    }

    /**
     * Start a quiz attempt.
     */
    public function start(Quiz $quiz): Response
    {
        // Ensure the user can only attempt quizzes for their own documents
        if ($quiz->pdfDocument->user_id !== Auth::id()) {
            abort(403);
        }

        // Load the quiz with its questions
        $quiz->load('questions');

        return Inertia::render('Quizzes/Take', [
            'quiz' => $quiz,
            'questions' => $quiz->questions,
        ]);
    }

    /**
     * Submit a quiz attempt.
     */
    public function submit(Request $request, Quiz $quiz)
    {
        // Ensure the user can only submit quizzes for their own documents
        if ($quiz->pdfDocument->user_id !== Auth::id()) {
            abort(403);
        }

        $request->validate([
            'answers' => 'required|array',
            'answers.*' => 'required|in:a,b,c,d',
        ]);

        // Load the quiz questions
        $quiz->load('questions');

        // Calculate the score
        $score = 0;
        $answers = [];

        foreach ($quiz->questions as $question) {
            $selectedAnswer = $request->answers[$question->id] ?? null;
            $isCorrect = $selectedAnswer === $question->correct_answer;

            if ($isCorrect) {
                $score++;
            }

            $answers[] = [
                'quiz_question_id' => $question->id,
                'selected_answer' => $selectedAnswer,
                'is_correct' => $isCorrect,
            ];
        }

        // Create the quiz attempt
        $attempt = QuizAttempt::create([
            'quiz_id' => $quiz->id,
            'user_id' => Auth::id(),
            'score' => $score,
            'total_questions' => $quiz->questions->count(),
            'completed_at' => now(),
        ]);

        // Save the answers
        $attempt->answers()->createMany($answers);

        return redirect()->route('quizzes.results', $attempt->id)
            ->with('message', 'Quiz submitted successfully.');
    }

    /**
     * Display the results of a quiz attempt.
     */
    public function results(QuizAttempt $quizAttempt): Response
    {
        // Ensure the user can only view their own quiz attempts
        if ($quizAttempt->user_id !== Auth::id()) {
            abort(403);
        }

        // Load the quiz attempt with its answers, questions, quiz, and learning plan
        $quizAttempt->load(['answers.question', 'quiz.pdfDocument', 'learningPlan']);

        // Check if a learning plan exists for this quiz attempt
        $hasLearningPlan = $quizAttempt->learningPlan->count() > 0;
        $learningPlanId = $hasLearningPlan ? $quizAttempt->learningPlan->first()->id : null;

        return Inertia::render('Quizzes/Results', [
            'attempt' => $quizAttempt,
            'quiz' => $quizAttempt->quiz,
            'document' => $quizAttempt->quiz->pdfDocument,
            'hasLearningPlan' => $hasLearningPlan,
            'learningPlanId' => $learningPlanId,
        ]);
    }
}
