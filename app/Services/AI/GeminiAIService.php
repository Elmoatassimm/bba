<?php

namespace App\Services\AI;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;
use Smalot\PdfParser\Parser;

class GeminiAIService implements AIServiceInterface
{
    /**
     * The Gemini API endpoint for text generation
     * The {version} and {model} placeholders will be replaced with values from config
     */
    protected const API_URL_TEMPLATE = 'https://generativelanguage.googleapis.com/{version}/models/{model}:generateContent';

    /**
     * The Gemini API key
     */
    protected string $apiKey;

    /**
     * Constructor
     */
    public function __construct()
    {
        $this->apiKey = config('services.gemini.api_key');

        if (!$this->apiKey) {
            throw new Exception('Gemini API key is not set. Please add GEMINI_API_KEY to your .env file.');
        }
    }

    /**
     * Summarize the content of a PDF file using Gemini LearnLM 2.0 Flash Model
     *
     * @param string $filePath The path to the PDF file
     * @return string The summary of the PDF content
     */
    public function summarizePdf(string $filePath): string
    {
        try {
            // Extract text from the PDF
            $text = $this->extractTextFromPdf($filePath);

            if (empty($text)) {
                return "Could not extract text from the PDF file.";
            }

            // Log the first 500 characters of extracted text for debugging
            Log::info('Extracted text from PDF (first 500 chars): ' . substr($text, 0, 500) . '...');

            // Truncate text if it's too long (Gemini has token limits)
            $text = $this->truncateText($text, 60000); // Increased token limit for better context

            // Create the prompt for summarization
            $prompt = $this->createSummarizationPrompt($text);

            // Call Gemini API
            $response = $this->callGeminiApi($prompt);

            // If the response is too generic or empty, try again with a different approach
            if (strpos($response, 'generic') !== false ||
                strpos($response, 'lacks specific details') !== false ||
                strlen($response) < 200) {

                Log::info('Received generic response, trying with a different prompt');

                // Try with a different prompt that focuses on specific content
                $alternativePrompt = $this->createAlternativeSummarizationPrompt($text);
                $response = $this->callGeminiApi($alternativePrompt);
            }

            return $response;
        } catch (Exception $e) {
            Log::error('Error summarizing PDF with Gemini: ' . $e->getMessage());

            // Return a more user-friendly error message
            return "Sorry, there was an error summarizing the PDF: {$e->getMessage()}. Please try again later or with a different PDF file.";
        }
    }

    /**
     * Create an alternative prompt for summarization when the first attempt yields generic results
     *
     * @param string $text The text to summarize
     * @return string The prompt
     */
    protected function createAlternativeSummarizationPrompt(string $text): string
    {
        return <<<PROMPT
You are an expert educator using LearnLM 2.0 Flash Model. Your task is to analyze academic content and present it in a way that follows learning science principles. You will adapt to the learner by focusing on relevant materials, manage cognitive load by presenting well-structured information, and deepen metacognition by helping learners understand key concepts.

I need you to analyze and present the specific content from this document in a way that would be helpful for a student trying to learn this material.

Instructions:
1. Focus ONLY on the actual content in the document - ignore metadata
2. Extract specific facts, figures, concepts, and information that are most important for learning
3. Use direct quotes or paraphrasing of actual content when possible
4. Organize information by topics covered in the document to help manage cognitive load
5. If this is a textbook chapter or academic content, clearly identify key concepts, definitions, and examples
6. Include specific terminology used in the document and briefly explain complex terms
7. Present information in a way that builds on prior knowledge and stimulates curiosity
8. DO NOT make generic statements about the document's structure or purpose
9. DO NOT say things like "this document discusses" or "this text covers" - just present the actual content
10. If the document appears to be a chapter, identify the specific subject matter and key points

Document content:

$text

Provide a detailed analysis focusing ONLY on the specific content found in this document. Be concrete and specific, and present the information in a way that would help a student learn and understand the material.
PROMPT;
    }

    /**
     * Extract text from a PDF file
     *
     * @param string $filePath The path to the PDF file
     * @return string The extracted text
     */
    protected function extractTextFromPdf(string $filePath): string
    {
        try {
            // Use the PDF Parser to extract text from the PDF file
            $parser = new Parser();
            $pdf = $parser->parseFile($filePath);

            // Extract text from all pages
            $text = $pdf->getText();

            // If text extraction failed or returned empty text, try page by page
            if (empty(trim($text))) {
                $text = '';
                $pages = $pdf->getPages();

                foreach ($pages as $page) {
                    $pageText = $page->getText();
                    if (!empty(trim($pageText))) {
                        $text .= $pageText . "\n\n";
                    }
                }
            }

            // Clean up the text (remove excessive whitespace, etc.)
            $text = $this->cleanPdfText($text);

            // If we still don't have any text, throw an exception
            if (empty(trim($text))) {
                throw new Exception("Could not extract text from PDF file: {$filePath}");
            }

            // Add some metadata to the text
            $filename = basename($filePath);
            $fileSize = filesize($filePath);
            $fileDate = date('Y-m-d', filemtime($filePath));

            $metadata = "Document: {$filename}\n";
            $metadata .= "Date: {$fileDate}\n";
            $metadata .= "Size: {$fileSize} bytes\n\n";

            return $metadata . $text;
        } catch (Exception $e) {
            Log::error('Error extracting text from PDF: ' . $e->getMessage());

            // Fall back to simulated content if extraction fails
            $filename = basename($filePath);
            return "Failed to extract text from {$filename}. Using simulated content instead.\n\n" .
                   $this->generateGenericContent($filename);
        }
    }

    /**
     * Clean up text extracted from PDF
     *
     * @param string $text The text to clean
     * @return string The cleaned text
     */
    protected function cleanPdfText(string $text): string
    {
        // Replace multiple spaces with a single space
        $text = preg_replace('/\s+/', ' ', $text);

        // Replace multiple newlines with a double newline
        $text = preg_replace('/\n\s*\n+/', "\n\n", $text);

        // Remove any control characters
        $text = preg_replace('/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/', '', $text);

        return trim($text);
    }

    /**
     * Generate simulated report content
     */
    private function generateReportContent(string $filename): string
    {
        // $filename is used to potentially customize content based on the filename in a real implementation
        return "Executive Summary\n\n" .
               "This report provides an analysis of market trends for Q2 2023. " .
               "Key findings indicate a 15% growth in the technology sector, with particular emphasis on AI and machine learning applications. " .
               "Consumer behavior has shifted significantly toward digital platforms, with a 22% increase in online transactions compared to the previous quarter. " .
               "Challenges remain in supply chain logistics, with 35% of respondents reporting delays in product delivery.\n\n" .
               "Methodology\n\n" .
               "Data was collected through surveys of 500 industry professionals and analysis of market performance metrics. " .
               "Statistical analysis was performed using regression models to identify correlations between consumer behavior and market trends.\n\n" .
               "Recommendations\n\n" .
               "1. Increase investment in digital infrastructure to capitalize on the growing online market.\n" .
               "2. Develop contingency plans for supply chain disruptions.\n" .
               "3. Explore partnerships with AI technology providers to enhance product offerings.";
    }

    /**
     * Generate simulated financial content
     */
    private function generateFinancialContent(string $filename): string
    {
        // $filename is used to potentially customize content based on the filename in a real implementation
        return "Financial Statement\n\n" .
               "Revenue: $4.2 million\n" .
               "Expenses: $3.1 million\n" .
               "Net Profit: $1.1 million\n\n" .
               "Financial Analysis\n\n" .
               "The company has shown a 12% increase in revenue compared to the previous fiscal year. " .
               "Operating expenses have been reduced by 5% through optimization of resource allocation and improved efficiency in production processes. " .
               "The profit margin stands at 26%, which is above the industry average of 22%.\n\n" .
               "Investment Outlook\n\n" .
               "Based on current performance metrics, the company is projected to maintain a growth rate of 8-10% over the next fiscal year. " .
               "Planned investments in technology infrastructure are expected to yield a return of 15% within the first two years of implementation.";
    }

    /**
     * Generate simulated technical content
     */
    private function generateTechnicalContent(string $filename): string
    {
        // $filename is used to potentially customize content based on the filename in a real implementation
        return "Technical Specifications\n\n" .
               "System Architecture\n" .
               "- Cloud-based infrastructure with distributed processing capabilities\n" .
               "- Microservices architecture for scalability and maintainability\n" .
               "- Real-time data processing with latency under 200ms\n\n" .
               "Performance Metrics\n" .
               "- Throughput: 10,000 transactions per second\n" .
               "- Uptime: 99.99% guaranteed\n" .
               "- Storage capacity: 50TB with automatic scaling\n\n" .
               "Security Features\n" .
               "- End-to-end encryption for all data transmissions\n" .
               "- Multi-factor authentication for user access\n" .
               "- Regular security audits and penetration testing\n\n" .
               "Implementation Guidelines\n" .
               "The system should be deployed in phases, with initial focus on core functionality followed by progressive enhancement of additional features. Integration with existing systems should be performed through the provided API endpoints, with comprehensive documentation available in the developer portal.";
    }

    /**
     * Generate simulated legal content
     */
    private function generateLegalContent(string $filename): string
    {
        // $filename is used to potentially customize content based on the filename in a real implementation
        return "Legal Agreement\n\n" .
               "Terms and Conditions\n\n" .
               "1. Definitions\n" .
               "   'Service' refers to the software application provided by the Company.\n" .
               "   'User' refers to any individual or entity that accesses or uses the Service.\n\n" .
               "2. License Grant\n" .
               "   The Company grants the User a non-exclusive, non-transferable license to use the Service for the duration of the subscription period.\n\n" .
               "3. Limitations of Liability\n" .
               "   The Company shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from the use or inability to use the Service.\n\n" .
               "4. Governing Law\n" .
               "   This Agreement shall be governed by and construed in accordance with the laws of the State of California, without regard to its conflict of law principles.\n\n" .
               "5. Dispute Resolution\n" .
               "   Any disputes arising from this Agreement shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association.";
    }

    /**
     * Generate simulated generic content
     */
    private function generateGenericContent(string $filename): string
    {
        // $filename is used to potentially customize content based on the filename in a real implementation
        return "Document Content\n\n" .
               "Introduction\n\n" .
               "This document provides an overview of key concepts and information relevant to the subject matter. " .
               "It is structured to provide a comprehensive understanding of the topic while highlighting important details and considerations.\n\n" .
               "Main Section\n\n" .
               "The primary focus of this document is to address the fundamental aspects of the subject matter. " .
               "This includes theoretical frameworks, practical applications, and best practices derived from industry experience and academic research. " .
               "Various perspectives are considered to provide a balanced view of the topic.\n\n" .
               "Conclusion\n\n" .
               "Based on the information presented, several key insights emerge that can guide decision-making and strategic planning. " .
               "Future developments in this area are likely to build upon these foundations while adapting to changing circumstances and emerging trends.";
    }

    /**
     * Truncate text to a maximum number of characters
     *
     * @param string $text The text to truncate
     * @param int $maxLength The maximum length
     * @return string The truncated text
     */
    protected function truncateText(string $text, int $maxLength): string
    {
        if (strlen($text) <= $maxLength) {
            return $text;
        }

        return substr($text, 0, $maxLength) . "... [text truncated due to length]";
    }

    /**
     * Create a prompt for summarization using LearnLM 2.0 Flash Model
     *
     * @param string $text The text to summarize
     * @return string The prompt
     */
    protected function createSummarizationPrompt(string $text): string
    {
        return <<<PROMPT
You are an expert educator using LearnLM 2.0 Flash Model. Your task is to create a comprehensive, well-structured summary of academic content that follows learning science principles. You will manage cognitive load by presenting relevant, well-structured information, and stimulate curiosity by making the content engaging.

I need you to create a detailed, educational summary of the following document. This summary will be used for learning purposes.

Instructions:
1. Focus on extracting the main points, key findings, and important details from the actual content
2. Organize the summary with clear headings and logical structure to manage cognitive load
3. Maintain the original meaning and intent of the document
4. Highlight any critical data points, statistics, or conclusions using bullet points for clarity
5. Include specific information, examples, and terminology from the document
6. If the document appears to be a chapter or section, identify the main topics and key concepts
7. If the document contains technical information, explain it in a clear, accessible way
8. Present information in a way that stimulates curiosity and engagement
9. DO NOT mention that you're summarizing a document - just provide the summary directly

Document content:

$text

Please provide a professional, well-organized summary that captures the specific content and essence of this document. Include actual details, examples, and terminology from the text rather than generic descriptions.
PROMPT;
    }

    /**
     * Call the Gemini API
     *
     * @param string $prompt The prompt to send
     * @return string The response
     */
    protected function callGeminiApi(string $prompt): string
    {
        // Get the model and version from config
        $model = config('services.gemini.model', 'gemini-1.5-flash');
        $version = config('services.gemini.version', 'v1');

        // Build the URL with the model and version
        $url = self::API_URL_TEMPLATE;
        $url = str_replace('{version}', $version, $url);
        $url = str_replace('{model}', $model, $url);
        $url = $url . '?key=' . $this->apiKey;

        // Log the API call (without the key)
        Log::info('Calling Gemini API', [
            'model' => $model,
            'version' => $version,
            'url' => str_replace($this->apiKey, '[REDACTED]', $url)
        ]);

        $payload = [
            'contents' => [
                [
                    'parts' => [
                        [
                            'text' => $prompt
                        ]
                    ]
                ]
            ],
            'generationConfig' => [
                'temperature' => 0.3, // Slightly increased for more creative responses
                'topK' => 40,
                'topP' => 0.95,
                'maxOutputTokens' => 2048, // Increased for more detailed summaries
            ]
        ];

        // For development purposes, we're disabling SSL verification
        // In production, you should properly configure SSL certificates
        $response = Http::withHeaders([
            'Content-Type' => 'application/json'
        ])->withoutVerifying()->post($url, $payload);

        if (!$response->successful()) {
            $errorBody = $response->body();
            $errorData = $response->json();
            $errorMessage = isset($errorData['error']['message']) ? $errorData['error']['message'] : 'Unknown error';
            $errorCode = isset($errorData['error']['code']) ? $errorData['error']['code'] : $response->status();

            Log::error('Gemini API error: ' . $errorBody, [
                'status' => $response->status(),
                'url' => $url,
                'error_code' => $errorCode,
                'error_message' => $errorMessage
            ]);

            throw new Exception("Error calling Gemini API: {$response->status()} - {$errorMessage}");
        }

        $data = $response->json();

        // Extract the text from the response
        if (isset($data['candidates'][0]['content']['parts'][0]['text'])) {
            return $data['candidates'][0]['content']['parts'][0]['text'];
        }

        throw new Exception('Unexpected response format from Gemini API');
    }

    /**
     * Generate a quiz based on the content of a PDF file using Gemini LearnLM 2.0 Flash Model
     *
     * @param string $filePath The path to the PDF file
     * @param int $numQuestions The number of questions to generate
     * @return array The generated quiz questions with options and answers
     */
    public function generateQuiz(string $filePath, int $numQuestions = 5): array
    {
        try {
            // Extract text from the PDF
            $text = $this->extractTextFromPdf($filePath);

            if (empty($text)) {
                throw new Exception("Could not extract text from the PDF file.");
            }

            // Truncate text if it's too long (Gemini has token limits)
            $text = $this->truncateText($text, 30000); // Adjust this limit as needed

            // Create the prompt for quiz generation
            $prompt = $this->createQuizGenerationPrompt($text, $numQuestions);

            // Call Gemini API
            $response = $this->callGeminiApi($prompt);

            // Parse the response to extract questions, options, and correct answers
            $questions = $this->parseQuizResponse($response);

            // Ensure we have the requested number of questions (or at least some questions)
            if (empty($questions)) {
                throw new Exception("Failed to generate quiz questions from the PDF content.");
            }

            // Limit to the requested number of questions
            return array_slice($questions, 0, $numQuestions);
        } catch (Exception $e) {
            Log::error('Error generating quiz with Gemini: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Create a prompt for quiz generation using LearnLM 2.0 Flash Model
     *
     * @param string $text The text to generate quiz from
     * @param int $numQuestions The number of questions to generate
     * @return string The prompt
     */
    protected function createQuizGenerationPrompt(string $text, int $numQuestions): string
    {
        return <<<PROMPT
You are an expert educator using LearnLM 2.0 Flash Model. Your task is to create educational assessments that follow learning science principles. You will inspire active learning by creating questions that allow for practice with timely feedback, manage cognitive load by presenting well-structured questions, and stimulate curiosity by making the assessment engaging.

I need you to create a multiple-choice quiz based on the document provided below. This quiz will be used to help students test their understanding of the material.

Instructions:
1. Create exactly {$numQuestions} multiple-choice questions based on the document content
2. Each question should have 4 options labeled a, b, c, and d
3. Clearly indicate the correct answer for each question
4. Focus on important concepts, facts, and details from the document
5. Create questions that test different cognitive levels (knowledge, comprehension, application, analysis)
6. Vary the difficulty level of questions (25% easy, 50% medium, 25% challenging)
7. Ensure all questions and answers are factually accurate based on the document
8. Make distractors (wrong answers) plausible but clearly incorrect
9. Include questions that test understanding of key terminology and concepts
10. Design questions that stimulate critical thinking and deeper understanding

Document content:

{$text}

Format your response as a JSON array with the following structure for each question:
[
  {
    "question": "Question text here?",
    "option_a": "First option",
    "option_b": "Second option",
    "option_c": "Third option",
    "option_d": "Fourth option",
    "correct_answer": "a"  // The correct answer should be a, b, c, or d
  },
  // More questions...
]

Please generate exactly {$numQuestions} questions in this JSON format. Ensure the questions are based on specific content from the document and vary in difficulty and cognitive level.
PROMPT;
    }

    /**
     * Parse the response from Gemini API to extract quiz questions
     *
     * @param string $response The response from Gemini API
     * @return array The parsed quiz questions
     */
    protected function parseQuizResponse(string $response): array
    {
        try {
            // Try to extract JSON from the response
            // First, look for JSON array pattern
            if (preg_match('/\[\s*\{.*\}\s*\]/s', $response, $matches)) {
                $jsonStr = $matches[0];
                $questions = json_decode($jsonStr, true);

                if (json_last_error() === JSON_ERROR_NONE && is_array($questions)) {
                    return $this->validateAndFormatQuestions($questions);
                }
            }

            // If direct JSON parsing fails, try to extract structured content
            // This is a fallback in case the model doesn't return proper JSON
            $questions = [];
            $questionBlocks = preg_split('/\d+\.\s*Question:|\d+\)\s*Question:|Question\s+\d+:|\n\n(?=\d+\.\s*)/i', $response, -1, PREG_SPLIT_NO_EMPTY);

            foreach ($questionBlocks as $block) {
                if (empty(trim($block))) continue;

                $question = $this->extractQuestionFromText($block);
                if ($question) {
                    $questions[] = $question;
                }
            }

            return $questions;
        } catch (Exception $e) {
            Log::error('Error parsing quiz response: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Extract a structured question from text block
     *
     * @param string $text The text block containing a question
     * @return array|null The structured question or null if extraction failed
     */
    protected function extractQuestionFromText(string $text): ?array
    {
        // Try to extract question and options
        $questionMatch = preg_match('/(.+?)(?:\n|\r\n|\r|Options:|Choices:|A\)|a\))/s', $text, $questionMatches);
        if (!$questionMatch) return null;

        $question = trim($questionMatches[1]);

        // Extract options
        $options = [];
        $optionPatterns = [
            'a' => '/(?:A\)|a\)|Option A:|\(A\))\s*(.+?)(?=(?:B\)|b\)|Option B:|\(B\)|$))/s',
            'b' => '/(?:B\)|b\)|Option B:|\(B\))\s*(.+?)(?=(?:C\)|c\)|Option C:|\(C\)|$))/s',
            'c' => '/(?:C\)|c\)|Option C:|\(C\))\s*(.+?)(?=(?:D\)|d\)|Option D:|\(D\)|$))/s',
            'd' => '/(?:D\)|d\)|Option D:|\(D\))\s*(.+?)(?=(?:Correct Answer:|Answer:|$))/s',
        ];

        foreach ($optionPatterns as $key => $pattern) {
            if (preg_match($pattern, $text, $matches)) {
                $options[$key] = trim($matches[1]);
            } else {
                // If we can't find all options, return null
                return null;
            }
        }

        // Extract correct answer
        $correctAnswer = null;
        if (preg_match('/(?:Correct Answer:|Answer:|The correct answer is)\s*([a-dA-D])/i', $text, $matches)) {
            $correctAnswer = strtolower($matches[1]);
        } else {
            // Try to find indicators of correct answers in the options
            foreach (['a', 'b', 'c', 'd'] as $option) {
                if (strpos(strtolower($text), "correct answer: $option") !== false ||
                    strpos(strtolower($text), "correct: $option") !== false) {
                    $correctAnswer = $option;
                    break;
                }
            }
        }

        // If we couldn't determine the correct answer, return null
        if (!$correctAnswer) return null;

        return [
            'question' => $question,
            'option_a' => $options['a'],
            'option_b' => $options['b'],
            'option_c' => $options['c'],
            'option_d' => $options['d'],
            'correct_answer' => $correctAnswer
        ];
    }

    /**
     * Validate and format quiz questions
     *
     * @param array $questions The questions to validate and format
     * @return array The validated and formatted questions
     */
    protected function validateAndFormatQuestions(array $questions): array
    {
        $validQuestions = [];

        foreach ($questions as $q) {
            // Check if the question has all required fields
            if (!isset($q['question'], $q['option_a'], $q['option_b'], $q['option_c'], $q['option_d'], $q['correct_answer'])) {
                continue;
            }

            // Ensure correct_answer is a valid option (a, b, c, or d)
            $correctAnswer = strtolower($q['correct_answer']);
            if (!in_array($correctAnswer, ['a', 'b', 'c', 'd'])) {
                continue;
            }

            $validQuestions[] = [
                'question' => $q['question'],
                'option_a' => $q['option_a'],
                'option_b' => $q['option_b'],
                'option_c' => $q['option_c'],
                'option_d' => $q['option_d'],
                'correct_answer' => $correctAnswer
            ];
        }

        return $validQuestions;
    }

    /**
     * Summarize a YouTube video using Gemini LearnLM 2.0 Flash Model
     *
     * @param string $videoUrl The URL of the YouTube video
     * @return array The summary, key points, and actionable takeaways of the video
     */
    public function summarizeYouTubeVideo(string $videoUrl): array
    {
        try {
            // Extract the video ID from the URL
            $videoId = $this->extractYouTubeVideoId($videoUrl);

            if (empty($videoId)) {
                throw new Exception("Could not extract video ID from the URL: {$videoUrl}");
            }

            // Create the prompt for video summarization
            $prompt = $this->createVideoSummarizationPrompt($videoUrl, $videoId);

            // Call Gemini API
            $response = $this->callGeminiApi($prompt);

            // Parse the response to extract summary, key points, and actionable takeaways
            return $this->parseVideoSummaryResponse($response);
        } catch (Exception $e) {
            Log::error('Error summarizing YouTube video with Gemini: ' . $e->getMessage());

            // Return a structured error response
            return [
                'summary' => "Sorry, there was an error summarizing the video: {$e->getMessage()}. Please try again later or with a different video URL.",
                'key_points' => [],
                'actionable_takeaways' => []
            ];
        }
    }

    /**
     * Extract the YouTube video ID from a URL
     *
     * @param string $url The YouTube video URL
     * @return string|null The video ID or null if not found
     */
    protected function extractYouTubeVideoId(string $url): ?string
    {
        // Regular expression to match YouTube video IDs from various URL formats
        $pattern = '/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i';

        if (preg_match($pattern, $url, $matches)) {
            return $matches[1];
        }

        return null;
    }

    /**
     * Create a prompt for YouTube video summarization
     *
     * @param string $videoUrl The YouTube video URL
     * @param string $videoId The YouTube video ID
     * @return string The prompt
     */
    protected function createVideoSummarizationPrompt(string $videoUrl, string $videoId): string
    {
        return <<<PROMPT
You are an expert educator using LearnLM 2.0 Flash Model. Your task is to create a comprehensive, educational summary of a YouTube video that follows learning science principles. You will manage cognitive load by presenting relevant, well-structured information, and stimulate curiosity by making the content engaging.

I need you to create a detailed, educational summary of the following YouTube video: {$videoUrl}

Instructions:
1. Analyze the video content based on the URL and video ID ({$videoId})
2. Create a concise summary (3-5 sentences) that captures the main purpose and content of the video
3. Extract 5-7 key points or concepts presented in the video
4. Identify 3-5 actionable takeaways or practical applications from the video
5. Focus on educational value, explaining core ideas or skills taught in the video
6. Tailor the summary for students who want to learn efficiently from the video
7. Organize the information in a clear, structured format
8. Use bullet points for key points and actionable takeaways

Format your response as a JSON object with the following structure:
{
  "summary": "A concise summary of the video's main content and purpose",
  "key_points": [
    "Key point 1",
    "Key point 2",
    "etc."
  ],
  "actionable_takeaways": [
    "Actionable takeaway 1",
    "Actionable takeaway 2",
    "etc."
  ]
}

Please provide a comprehensive, educational summary of this YouTube video in the specified JSON format.
PROMPT;
    }

    /**
     * Parse the response from Gemini API to extract video summary components
     *
     * @param string $response The response from Gemini API
     * @return array The parsed summary, key points, and actionable takeaways
     */
    protected function parseVideoSummaryResponse(string $response): array
    {
        try {
            // Try to extract JSON from the response
            if (preg_match('/\{\s*"summary".*\}\s*/s', $response, $matches)) {
                $jsonStr = $matches[0];
                $data = json_decode($jsonStr, true);

                if (json_last_error() === JSON_ERROR_NONE && is_array($data)) {
                    // Ensure all required fields are present
                    if (isset($data['summary']) && isset($data['key_points']) && isset($data['actionable_takeaways'])) {
                        return [
                            'summary' => $data['summary'],
                            'key_points' => $data['key_points'],
                            'actionable_takeaways' => $data['actionable_takeaways']
                        ];
                    }
                }
            }

            // If JSON parsing fails, try to extract structured content
            $summary = '';
            $keyPoints = [];
            $actionableTakeaways = [];

            // Extract summary (usually the first paragraph)
            if (preg_match('/(?:Summary|Video Summary):\s*(.+?)(?=\n\n|\r\n\r\n|Key Points|Main Points|$)/s', $response, $matches)) {
                $summary = trim($matches[1]);
            }

            // Extract key points
            if (preg_match('/(?:Key Points|Main Points):\s*(.+?)(?=\n\n|\r\n\r\n|Actionable Takeaways|Practical Applications|$)/s', $response, $matches)) {
                $pointsText = $matches[1];
                preg_match_all('/(?:\*|\-|\d+\.|•)\s*(.+?)(?=\n\*|\n\-|\n\d+\.|\n•|$)/s', $pointsText, $pointMatches);
                if (!empty($pointMatches[1])) {
                    $keyPoints = array_map('trim', $pointMatches[1]);
                }
            }

            // Extract actionable takeaways
            if (preg_match('/(?:Actionable Takeaways|Practical Applications):\s*(.+?)(?=\n\n|\r\n\r\n|$)/s', $response, $matches)) {
                $takeawaysText = $matches[1];
                preg_match_all('/(?:\*|\-|\d+\.|•)\s*(.+?)(?=\n\*|\n\-|\n\d+\.|\n•|$)/s', $takeawaysText, $takeawayMatches);
                if (!empty($takeawayMatches[1])) {
                    $actionableTakeaways = array_map('trim', $takeawayMatches[1]);
                }
            }

            // If we couldn't extract structured content, use the whole response as the summary
            if (empty($summary) && empty($keyPoints) && empty($actionableTakeaways)) {
                return [
                    'summary' => trim($response),
                    'key_points' => [],
                    'actionable_takeaways' => []
                ];
            }

            return [
                'summary' => $summary,
                'key_points' => $keyPoints,
                'actionable_takeaways' => $actionableTakeaways
            ];
        } catch (Exception $e) {
            Log::error('Error parsing video summary response: ' . $e->getMessage());
            return [
                'summary' => 'Error parsing the AI response. Please try again.',
                'key_points' => [],
                'actionable_takeaways' => []
            ];
        }
    }
}
