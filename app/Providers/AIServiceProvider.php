<?php

namespace App\Providers;

use App\Services\AI\AIServiceInterface;
use App\Services\AI\BasicAIService;
use App\Services\AI\GeminiAIService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\ServiceProvider;

class AIServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->bind(AIServiceInterface::class, function ($app) {
            // Check if Gemini API key is configured
            if (config('services.gemini.api_key')) {
                try {
                    return new GeminiAIService();
                } catch (\Exception $e) {
                    Log::warning('Failed to initialize GeminiAIService: ' . $e->getMessage());
                    Log::warning('Falling back to BasicAIService');
                }
            } else {
                Log::info('No Gemini API key configured, using BasicAIService');
            }

            // Fall back to BasicAIService
            return new BasicAIService();
        });
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
