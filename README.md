# PDF Upload and AI Summarization

A web application that allows users to upload PDF documents and get AI-generated summaries of their content.

## Features

- PDF document upload with drag-and-drop support
- AI-powered document summarization
- Advanced document management:
  - View, download, and delete documents
  - Reprocess existing documents with AI
  - Batch selection and operations
- Responsive UI built with React and Tailwind CSS
- Authentication and user-specific document storage

## Requirements

- PHP 8.2 or higher
- Composer
- Node.js and npm
- MySQL or another Laravel-supported database

## Installation

Follow these steps to set up the project locally:

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/bba-comp.git
cd bba-comp
```

### 2. Install PHP dependencies

```bash
composer install
```

### 3. Install JavaScript dependencies

```bash
npm install
```

### 4. Create environment file

```bash
cp .env.example .env
```

### 5. Generate application key

```bash
php artisan key:generate
```

### 6. Configure your database

Edit the `.env` file and set your database connection details:

```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_database_name
DB_USERNAME=your_database_username
DB_PASSWORD=your_database_password
```

### 7. Run database migrations

```bash
php artisan migrate
```

### 8. Create storage link

```bash
php artisan storage:link
```

### 9. Build frontend assets

```bash
npm run build
```

### 10. Start the development server

```bash
php artisan serve
```

The application will be available at `http://localhost:8000`.

## Usage

### Uploading and Processing Documents

1. Register a new account or log in to an existing one
2. Navigate to the PDF Documents section from the sidebar
3. Click "Upload PDF" to add a new document
4. Fill in the document title and select a PDF file
5. Submit the form to upload and process the document
6. View the AI-generated summary on the document's page

### Managing Existing Documents

1. On the PDF Documents page, you can see all your uploaded documents
2. Click on a document to view its details and summary
3. Use the actions menu (three dots) to:
   - Reprocess the document with AI to generate a new summary
   - Delete the document
4. You can select multiple documents using the checkboxes
5. Use the batch actions menu to perform operations on multiple documents at once

## AI Integration with Google Gemini

This application uses Google's Gemini AI with the LearnLM 2.0 Flash Model for PDF summarization. To set up the Gemini integration:

1. Obtain a Gemini API key from the [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add your API key to the `.env` file:

```
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-1.5-flash
GEMINI_API_VERSION=v1
```

3. The application will automatically use Gemini for PDF summarization

If the Gemini API key is not configured or there's an issue with the API, the application will fall back to a simulation mode that generates placeholder summaries.

### Troubleshooting Gemini API Issues

If you encounter errors when using the Gemini API, try the following:

1. **Check your API key**: Make sure your Gemini API key is valid and active
2. **Verify the model name**: Ensure you're using a valid model name (e.g., `gemini-1.5-flash`)
3. **Try a different API version**: If you get 404 errors, try changing the API version in your `.env` file:
   ```
   GEMINI_API_VERSION=v1beta
   ```
4. **Check the logs**: Look at the Laravel logs (`storage/logs/laravel.log`) for detailed error messages
5. **Verify API access**: Make sure your API key has access to the model you're trying to use

If all else fails, the application will automatically fall back to the simulation mode.

## How the AI Simulation Works

The current implementation includes a sophisticated simulation that:

1. Analyzes the filename to determine the document type (report, financial, technical, legal, academic)
2. Selects an appropriate template for that document type
3. Fills in placeholders with realistic-looking content
4. Adds a processing delay to simulate AI processing time
5. Returns a generated summary that mimics what a real AI service might produce

This simulation provides a realistic experience without requiring an actual AI integration.

## Testing

The application includes comprehensive tests to ensure proper functionality and security:

```bash
php artisan test
```

The tests verify that:

1. Users can upload PDF documents
2. Users can only view, reprocess, and delete their own documents
3. The document index only shows documents belonging to the current user
4. Guests cannot access protected routes
5. The Gemini AI integration works correctly

This ensures proper isolation between users and prevents unauthorized access to documents.

### Gemini AI Tests

The application includes specific tests for the Gemini AI integration:

```bash
php artisan test tests/Unit/GeminiAIServiceTest.php
php artisan test tests/Feature/PdfDocumentGeminiTest.php
```

These tests verify that:

1. The Gemini AI service initializes correctly
2. The service properly handles API errors
3. The service correctly processes PDF documents
4. Multiple users can use the AI service simultaneously
