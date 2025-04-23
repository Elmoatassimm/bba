<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class CoursePdfService
{
    protected $baseUrl;

    public function __construct()
    {
        $this->baseUrl = 'https://a71b-105-103-28-75.ngrok-free.app';
    }

    /**
     * Get all available courses
     *
     * @return array
     */
    public function getAllCourses(): array
    {
        try {
            $response = Http::get("{$this->baseUrl}/api/courses/");

            if ($response->successful()) {
                $responseData = $response->json() ?? [];

                // Check if the response has the expected structure
                if (isset($responseData['data']) && is_array($responseData['data'])) {
                    // Transform the data to match the expected format in the frontend
                    return array_map(function($course) {
                        return [
                            'id' => $course['url'] ?? uniqid(), // Use URL as ID or generate a unique ID
                            'title' => $course['name'] ?? 'Unknown Course',
                            'url' => $course['url'] ?? '#',
                            'description' => $course['summary'] ?? null
                        ];
                    }, $responseData['data']);
                }

                // If the response doesn't have the expected structure, return an empty array
                Log::warning('Unexpected response format from courses API', [
                    'response' => $responseData
                ]);

                // Create a placeholder course if there's an error message
                if (isset($responseData['status']) && $responseData['status'] === 'success' &&
                    isset($responseData['data'][0]['name']) && $responseData['data'][0]['name'] === 'Error Fetching Data') {
                    return [
                        [
                            'id' => 'placeholder-1',
                            'title' => 'Sample Course 1',
                            'url' => 'https://elearning.univ-bba.dz/course/view.php?id=1280',
                            'description' => 'This is a sample course while we resolve connection issues with the university server.'
                        ],
                        [
                            'id' => 'placeholder-2',
                            'title' => 'Sample Course 2',
                            'url' => 'https://elearning.univ-bba.dz/course/view.php?id=1281',
                            'description' => 'Another sample course for demonstration purposes.'
                        ],
                        [
                            'id' => 'placeholder-3',
                            'title' => 'Introduction to Programming',
                            'url' => 'https://elearning.univ-bba.dz/course/view.php?id=1282',
                            'description' => 'Learn the basics of programming with this introductory course.'
                        ]
                    ];
                }

                return [];
            }

            Log::error('Failed to fetch courses', [
                'status' => $response->status(),
                'response' => $response->body()
            ]);

            return [];
        } catch (\Exception $e) {
            Log::error('Exception when fetching courses', [
                'message' => $e->getMessage()
            ]);

            return [];
        }
    }

    /**
     * Get all departments
     *
     * @return array
     */
    public function getAllDepartments(): array
    {
        try {
            $response = Http::get("{$this->baseUrl}/api/departments/");

            if ($response->successful()) {
                return $response->json() ?? [];
            }

            Log::error('Failed to fetch departments', [
                'status' => $response->status(),
                'response' => $response->body()
            ]);

            return [];
        } catch (\Exception $e) {
            Log::error('Exception when fetching departments', [
                'message' => $e->getMessage()
            ]);

            return [];
        }
    }

    /**
     * Get courses by category
     *
     * @param int $categoryId
     * @return array
     */
    public function getCoursesByCategory(int $categoryId): array
    {
        try {
            $response = Http::get("{$this->baseUrl}/api/category/{$categoryId}/courses/");

            if ($response->successful()) {
                return $response->json() ?? [];
            }

            Log::error('Failed to fetch courses by category', [
                'categoryId' => $categoryId,
                'status' => $response->status(),
                'response' => $response->body()
            ]);

            return [];
        } catch (\Exception $e) {
            Log::error('Exception when fetching courses by category', [
                'categoryId' => $categoryId,
                'message' => $e->getMessage()
            ]);

            return [];
        }
    }

    /**
     * Get resources for a specific course
     *
     * @param int $courseId
     * @return array
     */
    public function getCourseResources(int $courseId): array
    {
        try {
            $response = Http::get("{$this->baseUrl}/api/course/{$courseId}/resources/");

            if ($response->successful()) {
                $responseData = $response->json() ?? [];

                // Check if the response has the expected structure
                if (isset($responseData['data']) && is_array($responseData['data'])) {
                    // Transform the data to match the expected format in the frontend
                    return array_map(function($resource) {
                        return [
                            'title' => $resource['name'] ?? 'Unknown Resource',
                            'url' => $resource['url'] ?? '#',
                            'type' => $resource['type'] ?? 'pdf',
                            'requires_auth' => $resource['requires_auth'] ?? false
                        ];
                    }, $responseData['data']);
                }

                // If the response doesn't have the expected structure, return sample data
                Log::warning('Unexpected response format from course resources API', [
                    'courseId' => $courseId,
                    'response' => $responseData
                ]);

                // Return sample resources for demonstration
                return [
                    [
                        'title' => 'Sample PDF 1',
                        'url' => 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                        'type' => 'PDF',
                        'requires_auth' => false
                    ],
                    [
                        'title' => 'Sample PDF 2',
                        'url' => 'https://www.africau.edu/images/default/sample.pdf',
                        'type' => 'PDF',
                        'requires_auth' => false
                    ],
                    [
                        'title' => 'Protected Resource',
                        'url' => 'https://elearning.univ-bba.dz/course/view.php?id=5873',
                        'type' => 'PDF',
                        'requires_auth' => true
                    ]
                ];
            }

            Log::error('Failed to fetch course resources', [
                'courseId' => $courseId,
                'status' => $response->status(),
                'response' => $response->body()
            ]);

            return [];
        } catch (\Exception $e) {
            Log::error('Exception when fetching course resources', [
                'courseId' => $courseId,
                'message' => $e->getMessage()
            ]);

            return [];
        }
    }

    /**
     * Get resources from a course URL with authentication if needed
     *
     * @param string $url
     * @param string|null $username
     * @param string|null $password
     * @return array
     */
    public function getResourcesFromUrl(string $url, ?string $username = null, ?string $password = null): array
    {
        try {
            $endpoint = $username && $password
                ? "{$this->baseUrl}/api/auth-resources/"
                : "{$this->baseUrl}/api/resources/";

            $payload = [
                'url' => $url
            ];

            if ($username && $password) {
                $payload['username'] = $username;
                $payload['password'] = $password;
            }

            $response = Http::post($endpoint, $payload);

            if ($response->successful()) {
                $responseData = $response->json() ?? [];

                // Check if the response has the expected structure
                if (isset($responseData['data']) && is_array($responseData['data'])) {
                    // Transform the data to match the expected format in the frontend
                    return array_map(function($resource) {
                        return [
                            'title' => $resource['name'] ?? 'Unknown Resource',
                            'url' => $resource['url'] ?? '#',
                            'type' => $resource['type'] ?? 'pdf',
                            'requires_auth' => $resource['requires_auth'] ?? false
                        ];
                    }, $responseData['data']);
                }

                // If the response doesn't have the expected structure, log a warning
                Log::warning('Unexpected response format from resources API', [
                    'url' => $url,
                    'response' => $responseData
                ]);

                // Return the response as is if it's not in the expected format
                return $responseData;
            }

            Log::error('Failed to fetch resources from URL', [
                'url' => $url,
                'status' => $response->status(),
                'response' => $response->body()
            ]);

            return [];
        } catch (\Exception $e) {
            Log::error('Exception when fetching resources from URL', [
                'url' => $url,
                'message' => $e->getMessage()
            ]);

            return [];
        }
    }

    /**
     * Download a PDF file from a URL and save it locally
     *
     * @param string $url
     * @param string $filename
     * @return string|null The local path to the saved file or null if failed
     */
    public function downloadPdf(string $url, string $filename): ?string
    {
        try {
            $response = Http::get($url);

            if ($response->successful()) {
                $path = 'course_pdfs/' . $filename;
                Storage::disk('public')->put($path, $response->body());
                return $path;
            }

            Log::error('Failed to download PDF', [
                'url' => $url,
                'status' => $response->status()
            ]);

            return null;
        } catch (\Exception $e) {
            Log::error('Exception when downloading PDF', [
                'url' => $url,
                'message' => $e->getMessage()
            ]);

            return null;
        }
    }
}
