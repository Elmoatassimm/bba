<?php

namespace App\Services;

use App\Models\LearningPlan;
use App\Models\LearningResource;
use App\Models\QuizAttempt;
use App\Models\QuizAnswer;
use App\Services\AI\AIServiceInterface;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Exception;

class LearningPlanService
{
    /**
     * The AI service instance.
     */
    protected AIServiceInterface $aiService;

    /**
     * Create a new service instance.
     */
    public function __construct(AIServiceInterface $aiService)
    {
        $this->aiService = $aiService;
    }

    /**
     * Generate a learning plan for a quiz attempt.
     *
     * @param QuizAttempt $quizAttempt The quiz attempt to generate a learning plan for
     * @return LearningPlan The generated learning plan
     */
    public function generateLearningPlan(QuizAttempt $quizAttempt): LearningPlan
    {
        // Create a new learning plan
        $learningPlan = LearningPlan::create([
            'quiz_attempt_id' => $quizAttempt->id,
            'user_id' => $quizAttempt->user_id,
            'title' => 'Learning Plan for ' . $quizAttempt->quiz->title,
            'status' => 'processing',
        ]);

        try {
            // Get the incorrect answers from the quiz attempt
            $incorrectAnswers = $this->getIncorrectAnswers($quizAttempt);

            // If there are no incorrect answers, return a simple learning plan
            if (empty($incorrectAnswers)) {
                $learningPlan->update([
                    'summary' => 'Congratulations! You answered all questions correctly. Keep up the good work!',
                    'status' => 'completed',
                ]);
                return $learningPlan;
            }

            // Get the PDF document path
            $pdfPath = Storage::disk('public')->path($quizAttempt->quiz->pdfDocument->file_path);

            // Generate learning resources using AI
            $result = $this->aiService->generateLearningResources($pdfPath, $incorrectAnswers);

            // Ensure we have a roadmap, even if the AI service didn't provide one
            $roadmap = $result['roadmap'] ?? null;

            // Process the roadmap to ensure proper formatting
            $processedRoadmap = $this->processRoadmap($roadmap);

            // If no roadmap was provided or processing failed, generate a fallback
            if (empty($processedRoadmap)) {
                $processedRoadmap = $this->generateFallbackRoadmap($incorrectAnswers);
            }

            // Log the roadmap for debugging
            Log::debug('Processed roadmap:', ['roadmap' => $processedRoadmap]);

            // Update the learning plan with the summary and roadmap
            $learningPlan->update([
                'summary' => $result['resources']['summary'] ?? 'Learning plan generated successfully.',
                'roadmap' => $processedRoadmap,
                'status' => 'completed',
            ]);

            // Save the learning resources
            $this->saveLearningResources($learningPlan, $result['resources']);

            return $learningPlan;
        } catch (Exception $e) {
            // Log the error
            Log::error('Error generating learning plan: ' . $e->getMessage());

            // Update the learning plan status to failed
            $learningPlan->update([
                'status' => 'failed',
            ]);

            throw $e;
        }
    }

    /**
     * Get the incorrect answers from a quiz attempt.
     *
     * @param QuizAttempt $quizAttempt The quiz attempt to get incorrect answers from
     * @return array The incorrect answers with question details
     */
    protected function getIncorrectAnswers(QuizAttempt $quizAttempt): array
    {
        $incorrectAnswers = [];

        // Load the quiz attempt with its answers and questions
        $quizAttempt->load(['answers.question', 'quiz.pdfDocument']);

        foreach ($quizAttempt->answers as $answer) {
            if (!$answer->is_correct) {
                $incorrectAnswers[] = [
                    'question' => $answer->question->question,
                    'selected_answer' => $answer->selected_answer,
                    'correct_answer' => $answer->question->correct_answer,
                    'quiz_question_id' => $answer->question->id,
                ];
            }
        }

        return $incorrectAnswers;
    }

    /**
     * Save learning resources to the database.
     *
     * @param LearningPlan $learningPlan The learning plan to save resources for
     * @param array $resources The resources to save
     * @return void
     */
    protected function saveLearningResources(LearningPlan $learningPlan, array $resources): void
    {
        // Check if the resources array has the expected structure
        if (!isset($resources['topics']) || !is_array($resources['topics'])) {
            Log::warning('Invalid resources structure', ['resources' => $resources]);
            return;
        }

        // Save each topic and its resources
        foreach ($resources['topics'] as $topic) {
            // Create a resource for the topic itself
            $topicResource = LearningResource::create([
                'learning_plan_id' => $learningPlan->id,
                'topic' => $topic['name'],
                'description' => $topic['description'],
                'priority' => $topic['priority'] ?? 1,
            ]);

            // Save the resources for the topic
            if (isset($topic['resources']) && is_array($topic['resources'])) {
                foreach ($topic['resources'] as $resource) {
                    LearningResource::create([
                        'learning_plan_id' => $learningPlan->id,
                        'topic' => $topic['name'],
                        'description' => $resource['description'] ?? '',
                        'resource_url' => $resource['url'] ?? null,
                        'resource_type' => $resource['type'] ?? 'other',
                        'priority' => $topic['priority'] ?? 1,
                    ]);
                }
            }
        }
    }

    /**
     * Get all learning plans for a user.
     *
     * @param int $userId The user ID to get learning plans for
     * @return \Illuminate\Database\Eloquent\Collection The learning plans
     */
    public function getLearningPlansForUser(int $userId)
    {
        return LearningPlan::where('user_id', $userId)
            ->with(['quizAttempt.quiz.pdfDocument', 'resources'])
            ->latest()
            ->get();
    }

    /**
     * Get a learning plan by ID.
     *
     * @param int $id The learning plan ID
     * @param int $userId The user ID to check ownership
     * @return LearningPlan|null The learning plan or null if not found
     */
    public function getLearningPlan(int $id, int $userId): ?LearningPlan
    {
        return LearningPlan::where('id', $id)
            ->where('user_id', $userId)
            ->with(['quizAttempt.quiz.pdfDocument', 'resources'])
            ->first();
    }

    /**
     * Delete a learning plan.
     *
     * @param LearningPlan $learningPlan The learning plan to delete
     * @return bool True if the learning plan was deleted, false otherwise
     */
    public function deleteLearningPlan(LearningPlan $learningPlan): bool
    {
        return $learningPlan->delete();
    }

    /**
     * Generate a fallback roadmap when the AI service doesn't provide one.
     *
     * @param array $incorrectAnswers The incorrect answers from the quiz attempt
     * @return string The fallback roadmap diagram code
     */
    protected function generateFallbackRoadmap(array $incorrectAnswers): string
    {
        // Extract topics from incorrect answers
        $topics = [];
        foreach ($incorrectAnswers as $answer) {
            // Extract a potential topic from the question
            $question = $answer['question'];
            $words = explode(' ', $question);
            $potentialTopic = implode(' ', array_slice($words, 0, min(3, count($words))));

            if (!in_array($potentialTopic, $topics)) {
                $topics[] = $potentialTopic;
            }
        }

        // Limit to 3 topics
        $topics = array_slice($topics, 0, 3);

        // If no topics were extracted, use default topics
        if (empty($topics)) {
            $topics = ['Basic Concepts', 'Advanced Topics', 'Practical Applications'];
        }

        // Generate a simple mindmap diagram with proper formatting
        $diagramCode = "mindmap\n";
        $diagramCode .= "  root((Learning Path))\n";

        // Add topics and subtopics
        foreach ($topics as $index => $topic) {
            $diagramCode .= "    " . $topic . "\n";

            // Add some subtopics
            $subtopics = $this->getSubtopicsForTopic($topic);
            foreach ($subtopics as $subtopic) {
                $diagramCode .= "      " . $subtopic . "\n";
            }
        }

        // Add a final branch for mastery
        $diagramCode .= "    Master Subject\n";
        $diagramCode .= "      Final Assessment\n";
        $diagramCode .= "      Ongoing Practice\n";

        return $diagramCode;
    }

    /**
     * Process the roadmap from the AI service to ensure it's properly formatted.
     *
     * @param string|null $roadmap The roadmap from the AI service
     * @return string|null The processed roadmap
     */
    protected function processRoadmap(?string $roadmap): ?string
    {
        if (empty($roadmap)) {
            return null;
        }

        // Check if the roadmap is already properly formatted with newlines
        if (strpos($roadmap, "\n") !== false) {
            return $roadmap;
        }

        // If it's a mindmap without proper formatting, format it
        if (strpos($roadmap, 'mindmap') === 0) {
            // Simple approach: just add newlines after specific keywords
            $result = "mindmap\n";

            // Extract the root node
            if (preg_match('/root\(\([^)]+\)\)/', $roadmap, $matches)) {
                $result .= "  " . $matches[0] . "\n";

                // Remove the matched part from roadmap for further processing
                $roadmap = str_replace($matches[0], '', $roadmap);
            }

            // Define main topics and subtopics
            $mainTopics = ['Basic Concepts', 'Advanced Topics', 'Practical Applications', 'Master Subject'];
            $subtopics = [
                'Introduction', 'Key Terminology', 'Fundamental Principles',
                'Detailed Analysis', 'Case Studies', 'Research Methods',
                'Hands-on Exercises', 'Real-world Examples', 'Problem Solving',
                'Final Assessment', 'Ongoing Practice'
            ];

            // Add main topics with proper indentation
            foreach ($mainTopics as $topic) {
                if (strpos($roadmap, $topic) !== false) {
                    $result .= "    " . $topic . "\n";

                    // Add subtopics for this main topic
                    foreach ($subtopics as $subtopic) {
                        if (strpos($roadmap, $subtopic) !== false) {
                            $result .= "      " . $subtopic . "\n";
                        }
                    }
                }
            }

            // Log the formatted roadmap
            Log::debug('Formatted roadmap:', ['original' => $roadmap, 'formatted' => $result]);

            return $result;
        }

        return $roadmap;
    }

    /**
     * Get subtopics for a given topic.
     *
     * @param string $topic The topic to get subtopics for
     * @return array The subtopics
     */
    protected function getSubtopicsForTopic(string $topic): array
    {
        // Define some generic subtopics based on the topic
        if (stripos($topic, 'basic') !== false || stripos($topic, 'concept') !== false) {
            return ['Introduction', 'Key Terminology', 'Fundamental Principles'];
        } elseif (stripos($topic, 'advanced') !== false) {
            return ['Detailed Analysis', 'Case Studies', 'Research Methods'];
        } elseif (stripos($topic, 'practical') !== false || stripos($topic, 'application') !== false) {
            return ['Hands-on Exercises', 'Real-world Examples', 'Problem Solving'];
        } else {
            // Generic subtopics
            return ['Understanding Concepts', 'Practical Applications', 'Further Study'];
        }
    }
}
