<?php

namespace App\Services\AI;

interface AIServiceInterface
{
    /**
     * Summarize the content of a PDF file.
     *
     * @param string $filePath The path to the PDF file
     * @return string The summary of the PDF content
     */
    public function summarizePdf(string $filePath): string;

    /**
     * Generate a quiz based on the content of a PDF file.
     *
     * @param string $filePath The path to the PDF file
     * @param int $numQuestions The number of questions to generate
     * @return array The generated quiz questions with options and answers
     */
    public function generateQuiz(string $filePath, int $numQuestions = 5): array;

    /**
     * Summarize a YouTube video.
     *
     * @param string $videoUrl The URL of the YouTube video
     * @return array The summary, key points, and actionable takeaways of the video
     */
    public function summarizeYouTubeVideo(string $videoUrl): array;
}