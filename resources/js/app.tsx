import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';
import mermaid from 'mermaid';

// Initialize mermaid globally with robust error handling
const initMermaid = () => {
    try {
        console.log('Initializing Mermaid.js...');

        // Default configuration for Mermaid
        const config = {
            startOnLoad: false, // We'll handle rendering manually for better control
            theme: window.document.documentElement.classList.contains('dark') ? 'dark' : 'default',
            securityLevel: 'loose',
            logLevel: 'error',
            fontFamily: 'Instrument Sans, sans-serif',

            // Better handling of complex diagrams
            flowchart: {
                useMaxWidth: false,
                htmlLabels: true,
                curve: 'basis',
                padding: 10,
                nodeSpacing: 30,
                rankSpacing: 50
            },

            // Fix for mindmap rendering issues
            mindmap: {
                useMaxWidth: false,
                padding: 15,
                maxNodeWidth: 200,
                htmlLabels: true
            },

            // Improve sequence diagram rendering
            sequence: {
                useMaxWidth: false,
                showSequenceNumbers: false,
                wrap: true,
                width: 150,
                actorMargin: 50,
                boxMargin: 10
            },

            // Class diagram settings
            classDiagram: {
                useMaxWidth: false,
                htmlLabels: true
            },

            // ER diagram settings
            er: {
                useMaxWidth: false,
                layoutDirection: 'TB'
            }
        };

        mermaid.initialize(config);
        console.log('Mermaid.js initialized successfully');

        // Store the configuration globally for components to access
        window.mermaidConfig = config;
    } catch (error) {
        console.error('Failed to initialize Mermaid.js:', error);

        // Try again after a short delay if initialization fails
        setTimeout(() => {
            try {
                mermaid.initialize({
                    startOnLoad: false,
                    theme: 'default',
                    securityLevel: 'loose'
                });
                console.log('Mermaid.js initialized with fallback configuration');
            } catch (fallbackError) {
                console.error('Failed to initialize Mermaid.js with fallback configuration:', fallbackError);
            }
        }, 1000);
    }
};

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', initMermaid);

// Also initialize immediately in case the DOM is already loaded
initMermaid();

// Add a theme change listener to reinitialize Mermaid when theme changes
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class' &&
            mutation.target === document.documentElement) {
            // Theme has changed, reinitialize Mermaid
            initMermaid();
        }
    });
});

// Start observing theme changes
observer.observe(document.documentElement, { attributes: true });

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
