# PDF Upload and AI Summarization

A web application that allows users to upload PDF documents and get AI-generated summaries of their content.

## Features

- PDF document upload with drag-and-drop support
- AI-powered document summarization
- Document management (view, download)
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

1. Register a new account or log in to an existing one
2. Navigate to the PDF Documents section from the sidebar
3. Click "Upload PDF" to add a new document
4. Fill in the document title and select a PDF file
5. Submit the form to upload and process the document
6. View the AI-generated summary on the document's page

## Customizing the AI Service

The application uses a simulated AI service by default. To integrate with a real AI service:

1. Open `app/Services/AI/BasicAIService.php`
2. Modify the `summarizePdf` method to connect to your preferred AI service (like OpenAI, Google Vertex AI, etc.)
3. Update the service provider in `app/Providers/AIServiceProvider.php` if needed

## How the AI Simulation Works

The current implementation includes a sophisticated simulation that:

1. Analyzes the filename to determine the document type (report, financial, technical, legal, academic)
2. Selects an appropriate template for that document type
3. Fills in placeholders with realistic-looking content
4. Adds a processing delay to simulate AI processing time
5. Returns a generated summary that mimics what a real AI service might produce

This simulation provides a realistic experience without requiring an actual AI integration.
