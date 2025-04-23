import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import MermaidDiagram from './MermaidDiagram.jsx';

// Function to clean up markdown content
const cleanMarkdown = (markdown) => {
    if (!markdown) return '';

    // Replace multiple consecutive newlines with just two (to create proper paragraphs)
    let cleaned = markdown.replace(/\n{3,}/g, '\n\n');

    // Fix code blocks that might be malformed
    cleaned = cleaned.replace(/```(\w+)\s*\n/g, '```$1\n');

    // Ensure proper spacing around headings
    cleaned = cleaned.replace(/\n(#{1,6}\s.*?)\n(?!\n)/g, '\n$1\n\n');

    // Fix lists that might not have proper spacing
    cleaned = cleaned.replace(/\n([*-]\s.*?)\n(?!\n|[*-])/g, '\n$1\n\n');

    return cleaned;
};

export default function MarkdownRenderer({ content, className = '' }) {
    const [mermaidDiagrams, setMermaidDiagrams] = useState([]);
    const [processedContent, setProcessedContent] = useState('');

    useEffect(() => {
        if (!content) {
            setProcessedContent('');
            setMermaidDiagrams([]);
            return;
        }

        // Clean up the markdown content
        const cleanedContent = cleanMarkdown(content);

        // Extract Mermaid diagrams
        const diagrams = [];
        const contentWithPlaceholders = cleanedContent.replace(/```mermaid\n([\s\S]*?)\n```/g, (match, code, offset) => {
            const index = diagrams.length;
            diagrams.push({ code: code.trim(), index });
            return `<MERMAID_DIAGRAM_${index}>`;
        });

        setMermaidDiagrams(diagrams);
        setProcessedContent(contentWithPlaceholders);
    }, [content]);

    if (!content) {
        return null;
    }

    // Function to render content with Mermaid diagrams
    const renderContentWithDiagrams = () => {
        if (!processedContent) return null;

        // Split content by Mermaid diagram placeholders
        const parts = processedContent.split(/(<MERMAID_DIAGRAM_\d+>)/);

        return parts.map((part, i) => {
            // Check if this part is a Mermaid diagram placeholder
            const match = part.match(/<MERMAID_DIAGRAM_(\d+)>/);
            if (match) {
                const index = parseInt(match[1], 10);
                const diagram = mermaidDiagrams.find(d => d.index === index);
                if (diagram) {
                    return (
                        <div key={`diagram-${index}`} className="my-4">
                            <MermaidDiagram
                                chart={diagram.code}
                                config={{
                                    theme: window.document.documentElement.classList.contains('dark') ? 'dark' : 'default',
                                    fontFamily: 'Instrument Sans, sans-serif'
                                }}
                            />
                        </div>
                    );
                }
                return null;
            }

            // Regular markdown content
            return part ? (
                <ReactMarkdown
                    key={`content-${i}`}
                    remarkPlugins={[remarkGfm]}
                    components={{
                        // Style headings
                        h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mt-6 mb-4" {...props} />,
                        h2: ({ node, ...props }) => <h2 className="text-xl font-bold mt-5 mb-3" {...props} />,
                        h3: ({ node, ...props }) => <h3 className="text-lg font-bold mt-4 mb-2" {...props} />,
                        h4: ({ node, ...props }) => <h4 className="text-base font-bold mt-3 mb-2" {...props} />,
                        h5: ({ node, ...props }) => <h5 className="text-sm font-bold mt-3 mb-1" {...props} />,
                        h6: ({ node, ...props }) => <h6 className="text-xs font-bold mt-3 mb-1" {...props} />,

                        // Style paragraphs
                        p: ({ node, ...props }) => <p className="my-2" {...props} />,

                        // Style lists
                        ul: ({ node, ...props }) => <ul className="list-disc pl-6 my-3" {...props} />,
                        ol: ({ node, ...props }) => <ol className="list-decimal pl-6 my-3" {...props} />,
                        li: ({ node, ...props }) => <li className="my-1" {...props} />,

                        // Style code blocks and inline code
                        code: ({ node, inline, className, children, ...props }) => {
                            const match = /language-(\w+)/.exec(className || '');
                            return !inline && match ? (
                                <pre className="bg-gray-100 dark:bg-gray-800 rounded p-3 my-4 overflow-x-auto">
                                    <code className={`language-${match[1]} text-sm`} {...props}>
                                        {children}
                                    </code>
                                </pre>
                            ) : (
                                <code className="bg-gray-100 dark:bg-gray-800 rounded px-1 py-0.5 text-sm font-mono" {...props}>
                                    {children}
                                </code>
                            );
                        },

                        // Style blockquotes
                        blockquote: ({ node, ...props }) => (
                            <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 py-1 my-3 text-gray-700 dark:text-gray-300 italic" {...props} />
                        ),

                        // Style tables
                        table: ({ node, ...props }) => (
                            <div className="overflow-x-auto my-4">
                                <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700" {...props} />
                            </div>
                        ),
                        thead: ({ node, ...props }) => <thead className="bg-gray-100 dark:bg-gray-800" {...props} />,
                        tbody: ({ node, ...props }) => <tbody className="divide-y divide-gray-200 dark:divide-gray-700" {...props} />,
                        tr: ({ node, ...props }) => <tr className="hover:bg-gray-50 dark:hover:bg-gray-900" {...props} />,
                        th: ({ node, ...props }) => <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" {...props} />,
                        td: ({ node, ...props }) => <td className="px-3 py-2 whitespace-nowrap text-sm" {...props} />,

                        // Style links
                        a: ({ node, ...props }) => (
                            <a className="text-blue-600 dark:text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />
                        ),

                        // Style horizontal rules
                        hr: ({ node, ...props }) => <hr className="my-6 border-gray-300 dark:border-gray-700" {...props} />,
                    }}
                >
                    {part}
                </ReactMarkdown>
            ) : null;
        });
    };

    return (
        <div className={`markdown-content ${className}`}>
            {renderContentWithDiagrams()}
        </div>
    );
}
