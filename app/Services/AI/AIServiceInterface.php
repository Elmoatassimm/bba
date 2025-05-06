<?php

namespace App\Services\AI;

interface AIServiceInterface
{
    /**
     * Summarize the content of a PDF file.
     *
     * @param string $filePath The path to the PDF file
     * @param bool $includeDiagram Whether to include a diagram in the summary
     * @param string $diagramType The type of diagram to generate (mindmap, flowchart, etc.)
     * @return string The summary of the PDF content
     */
    public function summarizePdf(string $filePath, bool $includeDiagram = true, string $diagramType = 'mindmap'): string;

    /**
     * Generate a quiz based on the content of a PDF file.
     *
     * @param string $filePath The path to the PDF file
     * @param int $numQuestions The number of questions to generate
     * @return array The generated quiz questions with options and answers
     */
    public function generateQuiz(string $filePath, int $numQuestions = 5): array;

    /**
     * Generate Mermaid diagrams (mind maps, flowcharts, etc.) based on the content of a PDF file.
     *
     * @param string $filePath The path to the PDF file
     * @param string $diagramType The type of diagram to generate (mindmap, flowchart, etc.)
     * @return array An array containing the diagram code and any additional information
     */
    public function generateDiagrams(string $filePath, string $diagramType = 'mindmap'): array;

    /**
     * Generate learning resources and recommendations based on quiz results.
     *
     * @param string $filePath The path to the PDF file
     * @param array $incorrectAnswers Array of incorrect answers with question details
     * @return array The generated learning resources and recommendations
     */
    public function generateLearningResources(string $filePath, array $incorrectAnswers): array;

    /**
     * Provide a contextual explanation for selected text from a PDF.
     *
     * @param string $selectedText The text selected by the user
     * @param string|null $filePath Optional path to the PDF file for context
     * @return string The explanation of the selected text
     */
    public function explainSelectedText(string $selectedText, ?string $filePath = null): string;
}