import React, { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { router } from '@inertiajs/react';

/**
 * A sidebar component that displays explanations for selected text in PDF documents.
 *
 * @param {Object} props Component props
 * @param {boolean} props.isOpen Whether the sidebar is open
 * @param {function} props.onClose Function to call when closing the sidebar
 * @param {string} props.selectedText The text selected by the user
 * @param {number|null} props.documentId Optional document ID for context
 */
export default function TextExplanationSidebar({ isOpen, onClose, selectedText, documentId = null }) {
    const [explanation, setExplanation] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Reset state when selected text changes
    useEffect(() => {
        if (selectedText) {
            setExplanation('');
            setError(null);
            fetchExplanation();
        }
    }, [selectedText, documentId]);

    // Fetch explanation from the API
    const fetchExplanation = async () => {
        if (!selectedText || selectedText.trim().length < 5) {
            setError('Please select more text to get an explanation.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Use Inertia's router.post for the API request
            // This automatically handles CSRF tokens
            const response = await fetch(route('text-explanation.explain'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    selected_text: selectedText,
                    document_id: documentId,
                }),
            });

            // Check if the response is a redirect (which could indicate a CSRF issue)
            if (response.redirected) {
                console.error('Request was redirected, possibly due to CSRF token mismatch');
                setError('Authentication error. Please refresh the page and try again.');
                return;
            }

            const data = await response.json();

            if (response.ok && data.success) {
                setExplanation(data.explanation);
            } else {
                console.error('API error:', data);
                setError(data.error || 'Failed to generate explanation. Please try again.');
            }
        } catch (error) {
            console.error('Error fetching explanation:', error);
            setError('An error occurred while generating the explanation. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle close
    const handleClose = () => {
        onClose();
        // Don't reset the explanation immediately to avoid UI flicker
    };

    // If the sidebar is closed, don't render anything
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed right-0 top-0 z-50 h-full w-96 overflow-hidden bg-white shadow-lg transition-transform dark:bg-gray-900">
            <div className="flex h-full flex-col">
                {/* Header */}
                <div className="flex items-center justify-between border-b p-4">
                    <h2 className="text-lg font-semibold">Text Explanation</h2>
                    <Button variant="ghost" size="sm" onClick={handleClose} className="h-8 w-8 p-0">
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                    </Button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {/* Selected text section */}
                    <div className="mb-4">
                        <h3 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">Selected Text</h3>
                        <div className="rounded-md border bg-gray-50 p-3 text-sm dark:bg-gray-800">
                            {selectedText || 'No text selected'}
                        </div>
                    </div>

                    {/* Explanation section */}
                    <div>
                        <h3 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">Explanation</h3>

                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <Loader2 className="mb-4 h-8 w-8 animate-spin text-primary" />
                                <p className="text-sm text-gray-500">Generating explanation...</p>
                                <p className="mt-2 text-xs text-gray-400">This may take a few moments</p>
                            </div>
                        ) : error ? (
                            <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
                                <div className="flex items-center">
                                    <AlertCircle className="mr-2 h-4 w-4" />
                                    <p>{error}</p>
                                </div>
                            </div>
                        ) : explanation ? (
                            <div className="prose max-w-none dark:prose-invert">
                                <MarkdownRenderer content={explanation} />
                            </div>
                        ) : (
                            <div className="rounded-md border border-blue-200 bg-blue-50 p-4 text-sm text-blue-600 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-400">
                                <p>Select text in the document to get an explanation.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t p-4">
                    <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm" onClick={handleClose}>
                            Close
                        </Button>
                        {selectedText && !isLoading && (
                            <Button
                                size="sm"
                                onClick={fetchExplanation}
                                disabled={isLoading}
                            >
                                Refresh
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
