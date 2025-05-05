import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidDiagramProps {
  content: string;
  className?: string;
}

export default function MermaidDiagram({ content, className = '' }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const renderDiagram = async () => {
      if (!containerRef.current || !content) return;

      try {
        // Reset any previous errors
        setError(null);

        // Format the content if needed
        let formattedContent = content;
        if (!content.includes('\n') && content.startsWith('mindmap')) {
          formattedContent = formatMermaidContent(content);
        }

        // Initialize mermaid with configuration
        mermaid.initialize({
          startOnLoad: false,
          theme: document.documentElement.classList.contains('dark') ? 'dark' : 'default',
          securityLevel: 'loose',
          fontFamily: 'Instrument Sans, sans-serif',
          flowchart: {
            useMaxWidth: false,
            htmlLabels: true,
            curve: 'basis'
          },
          mindmap: {
            padding: 20,
            maxNodeWidth: 200,
            htmlLabels: true
          }
        });

        // Clear the container
        containerRef.current.innerHTML = '';

        // Create a unique ID for the diagram
        const id = `mermaid-diagram-${Date.now()}`;
        
        // Render the diagram
        const { svg } = await mermaid.render(id, formattedContent);
        
        // Insert the rendered SVG
        containerRef.current.innerHTML = svg;
      } catch (err) {
        console.error('Error rendering mermaid diagram:', err);
        setError('Failed to render diagram. Please check the diagram syntax.');
        
        // Try to display the content as text
        if (containerRef.current) {
          containerRef.current.innerHTML = `<pre class="text-red-500 p-2">${content}</pre>`;
        }
      }
    };

    renderDiagram();
  }, [content]);

  // Helper function to format mermaid content
  const formatMermaidContent = (content: string): string => {
    if (content.startsWith('mindmap')) {
      const parts = content.split(/\s+/);
      let result = parts[0]; // 'mindmap'
      
      for (let i = 1; i < parts.length; i++) {
        const part = parts[i];
        
        if (part.includes('((') && part.includes('))')) {
          // Root node
          result += '\n  ' + part;
        } else if (i > 1 && ['Introduction', 'Key', 'Fundamental', 'Detailed', 'Case', 'Research', 
                            'Hands-on', 'Real-world', 'Problem', 'Final', 'Ongoing'].includes(part)) {
          // This is likely a subtopic
          result += '\n      ' + part;
        } else if (i > 1 && ['Basic', 'Advanced', 'Practical', 'Master'].includes(part)) {
          // This is likely a main topic
          result += '\n    ' + part;
        } else {
          // Continue the current line
          result += ' ' + part;
        }
      }
      
      return result;
    }
    
    return content;
  };

  return (
    <div className={`mermaid-diagram-container ${className}`}>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <div ref={containerRef} className="mermaid-render"></div>
    </div>
  );
}
