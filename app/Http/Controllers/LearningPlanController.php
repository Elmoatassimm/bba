<?php

namespace App\Http\Controllers;

use App\Models\LearningPlan;
use App\Models\QuizAttempt;
use App\Services\LearningPlanService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class LearningPlanController extends Controller
{
    /**
     * The learning plan service instance.
     */
    protected LearningPlanService $learningPlanService;

    /**
     * Create a new controller instance.
     */
    public function __construct(LearningPlanService $learningPlanService)
    {
        $this->learningPlanService = $learningPlanService;
    }

    /**
     * Display a listing of the learning plans.
     */
    public function index(): Response
    {
        $learningPlans = $this->learningPlanService->getLearningPlansForUser(Auth::id());

        return Inertia::render('LearningPlans/Index', [
            'learningPlans' => $learningPlans,
        ]);
    }

    /**
     * Generate a learning plan for a quiz attempt.
     */
    public function generate(QuizAttempt $quizAttempt)
    {
        // Ensure the user can only generate learning plans for their own quiz attempts
        if ($quizAttempt->user_id !== Auth::id()) {
            abort(403);
        }

        try {
            // Generate the learning plan
            $learningPlan = $this->learningPlanService->generateLearningPlan($quizAttempt);

            return redirect()->route('learning-plans.show', $learningPlan->id)
                ->with('message', 'Learning plan generated successfully.');
        } catch (\Exception $e) {
            // Log the error
            Log::error('Error generating learning plan: ' . $e->getMessage());

            return redirect()->back()
                ->with('error', 'Failed to generate learning plan. Please try again later.');
        }
    }

    /**
     * Display the specified learning plan.
     */
    public function show(LearningPlan $learningPlan): Response
    {
        // Ensure the user can only view their own learning plans
        if ($learningPlan->user_id !== Auth::id()) {
            abort(403);
        }

        // Load the learning plan with its relationships
        $learningPlan->load(['quizAttempt.quiz.pdfDocument', 'resources']);

        return Inertia::render('LearningPlans/Show', [
            'learningPlan' => $learningPlan,
            'quizAttempt' => $learningPlan->quizAttempt,
            'quiz' => $learningPlan->quizAttempt->quiz,
            'document' => $learningPlan->quizAttempt->quiz->pdfDocument,
        ]);
    }

    /**
     * Remove the specified learning plan from storage.
     */
    public function destroy(LearningPlan $learningPlan)
    {
        // Ensure the user can only delete their own learning plans
        if ($learningPlan->user_id !== Auth::id()) {
            abort(403);
        }

        // Delete the learning plan
        $this->learningPlanService->deleteLearningPlan($learningPlan);

        return redirect()->route('learning-plans.index')
            ->with('message', 'Learning plan deleted successfully.');
    }
}
