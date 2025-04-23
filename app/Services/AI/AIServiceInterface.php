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
}
