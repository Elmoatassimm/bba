import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

// This component focuses solely on rendering a Mermaid diagram
export default function MermaidRenderer({
    chart,
    className = '',
    config = {},
    onRenderSuccess = () => {},
    onRenderError = () => {},
    useDirectRendering = false
}) {
    const [renderedSvg, setRenderedSvg] = useState('');
    const [renderAttempts, setRenderAttempts] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [useDirectRender, setUseDirectRender] = useState(false);
    const containerRef = useRef(null);
    const mermaidRef = useRef(null);
    const uniqueId = useRef(`mermaid-${Math.random().toString(36).substring(2, 11)}`);

    // Detect dark mode
    const isDarkMode = () => {
        return window.document.documentElement.classList.contains('dark');
    };

    // Render the chart
    useEffect(() => {
        if (!chart) return;

        // Reset state for new rendering
        setIsLoading(true);
        setRenderedSvg('');
        setUseDirectRender(false);

        const renderMermaidChart = async () => {
            try {
                // Configure mermaid
                const mergedConfig = {
                    startOnLoad: false,
                    theme: isDarkMode() ? 'dark' : 'default',
                    securityLevel: 'loose',
                    logLevel: 'error',
                    fontFamily: 'Instrument Sans, sans-serif',
                    // Special settings for mindmaps
                    mindmap: {
                        useMaxWidth: false,
                        padding: 15,
                        maxNodeWidth: 200,
                        htmlLabels: true
                    },
                    // Better handling of complex diagrams
                    flowchart: {
                        useMaxWidth: false,
                        htmlLabels: true,
                        curve: 'basis',
                        padding: 10,
                        nodeSpacing: 30,
                        rankSpacing: 50
                    },
                    ...config
                };

                // Initialize with our configuration
                mermaid.initialize(mergedConfig);

                // Decide on rendering method
                if (useDirectRendering || chart.includes('mindmap')) {
                    // Use direct rendering for mindmaps
                    setUseDirectRender(true);
                    setIsLoading(false);
                    onRenderSuccess('direct-render');
                    return;
                }

                // For other diagrams, use SVG rendering
                // Create a temporary container for rendering
                const tempContainer = document.createElement('div');
                tempContainer.style.display = 'none';
                document.body.appendChild(tempContainer);

                try {
                    // Standard SVG rendering approach
                    const { svg } = await mermaid.render(
                        `${uniqueId.current}-${renderAttempts}`,
                        chart,
                        tempContainer
                    );

                    // Store the rendered SVG
                    setRenderedSvg(svg);
                    setIsLoading(false);

                    // Notify parent of success
                    onRenderSuccess(svg);
                } finally {
                    // Clean up the temporary container
                    if (document.body.contains(tempContainer)) {
                        document.body.removeChild(tempContainer);
                    }
                }
            } catch (error) {
                console.error('Error rendering Mermaid diagram:', error);

                // Notify parent of error
                onRenderError(error);

                // If we haven't tried too many times, try again with a delay
                if (renderAttempts < 3) {
                    setTimeout(() => {
                        setRenderAttempts(prev => prev + 1);
                    }, 500);
                } else {
                    setIsLoading(false);
                }
            }
        };

        // Render with a slight delay to ensure the DOM is ready
        const timerId = setTimeout(() => {
            renderMermaidChart();
        }, 100);

        return () => {
            clearTimeout(timerId);
        };
    }, [chart, renderAttempts, config, onRenderSuccess, onRenderError, useDirectRendering]);

    // Handle direct rendering after the component has mounted
    useEffect(() => {
        if (!useDirectRender || !mermaidRef.current || !chart) return;

        const processMermaid = async () => {
            try {
                // Process the mermaid diagram
                await mermaid.run({
                    nodes: [mermaidRef.current],
                    suppressErrors: false
                });
            } catch (error) {
                console.error('Error with direct rendering:', error);
                // If direct rendering fails, try SVG rendering
                setUseDirectRender(false);
                setRenderAttempts(prev => prev + 1);
            }
        };

        processMermaid();
    }, [chart, useDirectRender]);

    // Handle theme changes
    useEffect(() => {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class' && renderAttempts < 5) {
                    // If theme changes, trigger a re-render
                    setRenderAttempts(prev => prev + 1);
                }
            });
        });

        observer.observe(document.documentElement, { attributes: true });

        return () => observer.disconnect();
    }, [renderAttempts]);

    return (
        <div className={`mermaid-renderer ${className}`} ref={containerRef}>
            {isLoading ? (
                <div className="flex items-center justify-center p-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-500"></div>
                </div>
            ) : useDirectRender ? (
                // For direct rendering, use a div with the mermaid class
                <div className="mermaid" ref={mermaidRef}>
                    {chart}
                </div>
            ) : renderedSvg ? (
                // For SVG rendering, insert the SVG content
                <div dangerouslySetInnerHTML={{ __html: renderedSvg }} />
            ) : (
                // Fallback for errors
                <div className="p-4 text-sm text-red-500">
                    Failed to render diagram. Please try again.
                </div>
            )}
        </div>
    );
}
