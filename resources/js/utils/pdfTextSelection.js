/**
 * Utility functions for handling text selection in PDF iframes
 */

/**
 * Adds event listeners to detect text selection in a PDF iframe
 *
 * @param {HTMLIFrameElement} iframe The iframe element containing the PDF
 * @param {Function} onTextSelected Callback function that receives the selected text
 * @returns {Function} A cleanup function to remove the event listeners
 */
export function setupPdfTextSelection(iframe, onTextSelected) {
    if (!iframe) {
        console.error('No iframe provided for text selection setup');
        return () => {};
    }

    console.log('Setting up PDF text selection for iframe:', iframe);

    // Function to handle text selection in the parent document
    const handleParentSelection = () => {
        try {
            // Get the selection from the parent window
            const selection = window.getSelection();
            const selectedText = selection?.toString() || '';

            // If there's selected text, call the callback
            if (selectedText.trim().length > 0) {
                console.log('Selected text from parent document:', selectedText);
                onTextSelected(selectedText);
            }
        } catch (error) {
            console.error('Error handling parent document text selection:', error);
        }
    };

    // Function to handle text selection in the iframe
    const handleIframeSelection = () => {
        try {
            // Try to access the iframe's content window
            const iframeWindow = iframe.contentWindow;
            if (!iframeWindow) {
                console.error('Cannot access iframe content window');
                return;
            }

            try {
                // Try to get the selected text from the iframe
                const selectedText = iframeWindow.getSelection()?.toString() || '';

                // If there's selected text, call the callback
                if (selectedText.trim().length > 0) {
                    console.log('Selected text from iframe:', selectedText);
                    onTextSelected(selectedText);
                }
            } catch (innerError) {
                console.error('Error accessing iframe selection:', innerError);
                // This is likely a cross-origin issue
            }
        } catch (error) {
            console.error('Error handling iframe text selection:', error);
        }
    };

    // Add mouseup event to the parent document
    document.addEventListener('mouseup', handleParentSelection);

    // Add selectionchange event to the parent document
    document.addEventListener('selectionchange', handleParentSelection);

    // Try to access the iframe content
    const setupIframeListeners = () => {
        try {
            // Wait for the iframe to load
            if (iframe.contentDocument && iframe.contentDocument.readyState === 'complete') {
                console.log('Iframe loaded, setting up listeners');

                // Add mouseup event listener to detect selection
                iframe.contentDocument.addEventListener('mouseup', handleIframeSelection);

                // Add selectionchange event listener
                iframe.contentDocument.addEventListener('selectionchange', handleIframeSelection);

                // Add keyup event listener to detect keyboard selection (e.g., Shift+Arrow)
                iframe.contentDocument.addEventListener('keyup', handleIframeSelection);
            } else {
                // If not loaded yet, try again after a delay
                console.log('Iframe not loaded yet, retrying in 500ms');
                setTimeout(setupIframeListeners, 500);
            }
        } catch (error) {
            // This might fail due to cross-origin restrictions
            console.error('Error setting up iframe listeners (likely cross-origin):', error);

            // We're already listening for selection changes in the parent window
            console.log('Falling back to parent document selection events only');
        }
    };

    // Start setting up listeners
    setupIframeListeners();

    // Add load event listener to the iframe
    iframe.addEventListener('load', () => {
        console.log('Iframe load event triggered, setting up listeners');
        setupIframeListeners();
    });

    // Return a cleanup function
    return () => {
        try {
            document.removeEventListener('mouseup', handleParentSelection);
            document.removeEventListener('selectionchange', handleParentSelection);

            try {
                if (iframe.contentDocument) {
                    iframe.contentDocument.removeEventListener('mouseup', handleIframeSelection);
                    iframe.contentDocument.removeEventListener('selectionchange', handleIframeSelection);
                    iframe.contentDocument.removeEventListener('keyup', handleIframeSelection);
                }
            } catch (innerError) {
                console.error('Error removing iframe listeners:', innerError);
            }
        } catch (error) {
            console.error('Error cleaning up PDF text selection listeners:', error);
        }
    };
}

/**
 * Checks if the current selection is within the PDF iframe
 *
 * @param {HTMLIFrameElement} iframe The iframe element containing the PDF
 * @returns {boolean} True if the selection is within the iframe
 */
export function isSelectionInPdfIframe(iframe) {
    if (!iframe) return false;

    try {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return false;

        const range = selection.getRangeAt(0);
        const container = range.commonAncestorContainer;

        // Check if the selection container is within the iframe
        return iframe.contentDocument && iframe.contentDocument.contains(container);
    } catch (error) {
        console.error('Error checking if selection is in PDF iframe:', error);
        return false;
    }
}
