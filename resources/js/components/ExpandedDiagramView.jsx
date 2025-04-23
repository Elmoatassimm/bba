import React, { useEffect, useState } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import MermaidRenderer from './MermaidRenderer.jsx';
import ErrorBoundary from './ErrorBoundary.jsx';

export default function ExpandedDiagramView({ chart, onClose, config = {} }) {
    const [zoomLevel, setZoomLevel] = useState(100);
    const [renderAttempt, setRenderAttempt] = useState(0);

    // Prevent scrolling of the background when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    // Handle zoom in
    const handleZoomIn = () => {
        setZoomLevel(prev => Math.min(prev + 20, 200));
    };

    // Handle zoom out
    const handleZoomOut = () => {
        setZoomLevel(prev => Math.max(prev - 20, 40));
    };

    // Reset zoom
    const resetZoom = () => {
        setZoomLevel(100);
    };

    // Handle keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Escape key to close
            if (e.key === 'Escape') {
                onClose();
                return;
            }

            // Ctrl/Cmd + Plus to zoom in
            if ((e.ctrlKey || e.metaKey) && e.key === '+') {
                e.preventDefault();
                handleZoomIn();
                return;
            }

            // Ctrl/Cmd + Minus to zoom out
            if ((e.ctrlKey || e.metaKey) && e.key === '-') {
                e.preventDefault();
                handleZoomOut();
                return;
            }

            // Ctrl/Cmd + 0 to reset zoom
            if ((e.ctrlKey || e.metaKey) && e.key === '0') {
                e.preventDefault();
                resetZoom();
                return;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="relative h-[90vh] w-[90vw] rounded-lg bg-white p-6 shadow-xl dark:bg-gray-900">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                >
                    <X className="h-6 w-6" />
                    <span className="sr-only">Close</span>
                </button>

                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold">Expanded Diagram View</h2>
                        <p className="mt-1 text-xs text-gray-500">Use Ctrl/Cmd + +/- to zoom, Ctrl/Cmd + 0 to reset, Esc to close</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">{zoomLevel}%</span>

                        <div className="flex items-center rounded-md border bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                            <button
                                onClick={handleZoomOut}
                                className="rounded-l-md border-r p-1.5 text-gray-500 hover:bg-gray-50 hover:text-gray-700 dark:border-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                                title="Zoom out"
                                disabled={zoomLevel <= 40}
                            >
                                <ZoomOut className="h-4 w-4" />
                                <span className="sr-only">Zoom out</span>
                            </button>

                            <button
                                onClick={resetZoom}
                                className="border-r p-1.5 text-gray-500 hover:bg-gray-50 hover:text-gray-700 dark:border-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                                title="Reset zoom"
                            >
                                <RotateCcw className="h-4 w-4" />
                                <span className="sr-only">Reset zoom</span>
                            </button>

                            <button
                                onClick={handleZoomIn}
                                className="rounded-r-md p-1.5 text-gray-500 hover:bg-gray-50 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                                title="Zoom in"
                                disabled={zoomLevel >= 200}
                            >
                                <ZoomIn className="h-4 w-4" />
                                <span className="sr-only">Zoom in</span>
                            </button>
                        </div>

                        <button
                            onClick={() => setRenderAttempt(prev => prev + 1)}
                            className="rounded-md border p-1.5 text-gray-500 hover:bg-gray-50 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                            title="Retry rendering"
                        >
                            <RotateCcw className="h-4 w-4" />
                            <span className="sr-only">Retry rendering</span>
                        </button>
                    </div>
                </div>

                <div className="expanded-diagram h-[calc(90vh-120px)] overflow-auto">
                    <div style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top left', transition: 'transform 0.2s ease' }}>
                        <ErrorBoundary onReset={() => setRenderAttempt(prev => prev + 1)}>
                            <MermaidRenderer
                                chart={chart}
                                className="w-full"
                                key={`expanded-${renderAttempt}`}
                                config={{
                                    ...config,
                                    // Increase size for expanded view
                                    fontSize: 16,
                                    useMaxWidth: false
                                }}
                                useDirectRendering={chart.includes('mindmap')}
                            />
                        </ErrorBoundary>
                    </div>
                </div>
            </div>
        </div>
    );
}
