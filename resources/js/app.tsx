import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';
import mermaid from 'mermaid';

// Initialize mermaid globally
const initMermaid = () => {
    try {
        console.log('Initializing Mermaid.js...');
        mermaid.initialize({
            startOnLoad: true,
            theme: 'default',
            securityLevel: 'loose',
            logLevel: 'error',
            fontFamily: 'Instrument Sans, sans-serif',
            // Better handling of complex diagrams
            flowchart: {
                useMaxWidth: false,
                htmlLabels: true,
                curve: 'basis'
            },
            // Fix for mindmap rendering issues
            mindmap: {
                useMaxWidth: false,
                padding: 10,
                maxNodeWidth: 200
            },
            // Improve sequence diagram rendering
            sequence: {
                useMaxWidth: false,
                showSequenceNumbers: false,
                wrap: true,
                width: 150
            }
        });
        console.log('Mermaid.js initialized successfully');
    } catch (error) {
        console.error('Failed to initialize Mermaid.js:', error);
    }
};

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', initMermaid);

// Also initialize immediately in case the DOM is already loaded
initMermaid();

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
