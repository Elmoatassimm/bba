<?php

namespace Tests\Unit;

use App\Providers\AIServiceProvider;
use App\Services\AI\AIServiceInterface;
use App\Services\AI\BasicAIService;
use App\Services\AI\GeminiAIService;
use Illuminate\Support\Facades\Config;
use Tests\TestCase;

class AIServiceProviderTest extends TestCase
{
    public function test_service_provider_registers_gemini_service_with_valid_api_key()
    {
        // Set a valid API key
        Config::set('services.gemini.api_key', 'valid-api-key');
        
        // Resolve the service from the container
        $service = app(AIServiceInterface::class);
        
        // Verify it's the Gemini service
        $this->assertInstanceOf(GeminiAIService::class, $service);
    }
    
    public function test_service_provider_falls_back_to_basic_service_without_api_key()
    {
        // Remove the API key
        Config::set('services.gemini.api_key', null);
        
        // Resolve the service from the container
        $service = app(AIServiceInterface::class);
        
        // Verify it's the basic service
        $this->assertInstanceOf(BasicAIService::class, $service);
    }
}
