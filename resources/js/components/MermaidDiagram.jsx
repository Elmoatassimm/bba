import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

// Initialize mermaid globally with default configuration
mermaid.initialize({
    startOnLoad: false,  // We'll manually render
    theme: 'default',
    securityLevel: 'loose',
    logLevel: 'error',
});

// Function to detect dark mode
const isDarkMode = () => {
    return window.document.documentElement.classList.contains('dark');
};

// Function to simplify complex diagrams
const simplifyDiagram = (chart) => {
    // Check if it's a mindmap with sub() syntax
    if (chart.includes('mindmap') && chart.includes('sub(')) {
        try {
            // Try to fix the mindmap syntax first
            const fixedMindmap = fixMindmapSyntax(chart);

            // If the mindmap is still complex, convert to flowchart
            if (fixedMindmap.split('\n').length > 30) {
                return convertMindmapToFlowchart(chart);
            }

            return fixedMindmap;
        } catch (error) {
            console.error('Error simplifying mindmap:', error);
            // Fallback to flowchart conversion if anything goes wrong
            return convertMindmapToFlowchart(chart);
        }
    }

    // Check if it's a complex flowchart
    if ((chart.includes('graph TD') || chart.includes('flowchart TD')) && chart.split('\n').length > 20) {
        return simplifyFlowchart(chart);
    }

    return chart;
};

// Function to simplify a complex flowchart
const simplifyFlowchart = (chart) => {
    const lines = chart.split('\n');
    const firstLine = lines[0]; // Keep the flowchart/graph declaration

    // Extract nodes and connections
    const nodes = [];
    const connections = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();

        // Skip empty lines and subgraph declarations
        if (!line || line.startsWith('subgraph')) continue;

        // Extract node definitions (e.g., A[Node Label])
        const nodeMatch = line.match(/^\s*([A-Za-z0-9]+)\s*\[([^\]]+)\]/);
        if (nodeMatch) {
            nodes.push({ id: nodeMatch[1], label: nodeMatch[2] });
            continue;
        }

        // Extract connections (e.g., A --> B)
        const connectionMatch = line.match(/^\s*([A-Za-z0-9]+)\s*--+>\s*([A-Za-z0-9]+)/);
        if (connectionMatch) {
            connections.push({ from: connectionMatch[1], to: connectionMatch[2] });
        }
    }

    // Limit to 10 nodes and 15 connections
    const limitedNodes = nodes.slice(0, 10);
    const limitedConnections = connections.slice(0, 15);

    // Rebuild a simpler flowchart
    let simplifiedChart = firstLine;

    // Add node definitions
    limitedNodes.forEach(node => {
        simplifiedChart += `\n  ${node.id}[${node.label}]`;
    });

    // Add connections
    limitedConnections.forEach(conn => {
        simplifiedChart += `\n  ${conn.from} --> ${conn.to}`;
    });

    return simplifiedChart;
};

// Function to convert a mindmap with sub() syntax to standard mindmap format
const convertSubMindmapToStandard = (chart) => {
    if (!chart.includes('mindmap') || !chart.includes('sub(')) {
        return chart;
    }

    const lines = chart.split('\n');
    const result = [];
    let currentLevel = 0;
    let indentStack = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        if (line.startsWith('mindmap')) {
            result.push(line);
            currentLevel = 0;
            indentStack = [0];
        } else if (line.startsWith('root((')) {
            result.push('  ' + line);
            currentLevel = 1;
            indentStack = [1];
        } else if (line.startsWith('sub(')) {
            // Extract the content from sub("content")
            const match = line.match(/sub\("(.+?)"\)/);
            if (match && match[1]) {
                const content = match[1];

                // Check if we need to go back up in the hierarchy
                if (i > 0 && lines[i-1].trim().startsWith('sub(') && currentLevel > 1) {
                    // Same level as previous sub(), stay at current level
                    indentStack.pop();
                    currentLevel--;
                }

                // Add indentation based on current level
                const indent = '  '.repeat(currentLevel + 1);

                // Add the node with appropriate syntax based on level
                if (currentLevel === 1) {
                    // First level after root - use double parentheses
                    result.push(`${indent}${content}`);
                } else {
                    // Deeper levels - use plain text
                    result.push(`${indent}${content}`);
                }

                // Increase level for next potential child
                currentLevel++;
                indentStack.push(currentLevel);
            }
        } else if (line) {
            // Keep other lines as they are with proper indentation
            const indent = '  '.repeat(currentLevel);
            result.push(`${indent}${line}`);
        }
    }

    return result.join('\n');
};

// Function to fix mindmap syntax
const fixMindmapSyntax = (chart) => {
    if (!chart.includes('mindmap') || !chart.includes('sub(')) {
        return chart;
    }

    // First try the direct conversion to standard mindmap format
    const standardMindmap = convertSubMindmapToStandard(chart);

    // For complex mindmaps with many sub() calls, convert to flowchart as fallback
    if (chart.split('\n').length > 30 && (chart.match(/sub\(/g) || []).length > 15) {
        return convertMindmapToFlowchart(chart);
    }

    return standardMindmap;
};

// Function to convert a complex mindmap to a simpler flowchart
const convertMindmapToFlowchart = (chart) => {
    // Extract the root node title
    const rootMatch = chart.match(/root\(\(([^)]+)\)\)/);
    const rootTitle = rootMatch ? rootMatch[1] : 'Main Topic';

    // Parse the mindmap structure
    const lines = chart.split('\n');
    const topics = [];
    let currentPath = [];
    let level = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        if (line.startsWith('root((')) {
            currentPath = [rootTitle];
            level = 1;
        } else if (line.startsWith('sub(')) {
            // Extract the content from sub("content")
            const match = line.match(/sub\("(.+?)"\)/);
            if (match && match[1]) {
                const content = match[1];

                // Adjust the path based on the level
                if (currentPath.length >= level) {
                    // We're at the same level as before, replace the last item
                    currentPath = [...currentPath.slice(0, level - 1), content];
                } else {
                    // We're at a deeper level, add to the path
                    currentPath.push(content);
                }

                level++;

                // Add this topic to our list
                if (currentPath.length <= 2) { // Only get first and second level topics
                    topics.push({
                        level: currentPath.length - 1,
                        path: [...currentPath],
                        content
                    });
                }
            }
        }

        // Check if we need to adjust the level based on the next line
        if (i < lines.length - 1) {
            const nextLine = lines[i + 1].trim();
            if (nextLine.startsWith('sub(') && level > 1) {
                level--;
            }
        }
    }

    // Filter to get only the main topics (level 1)
    const mainTopics = topics.filter(t => t.level === 1).map(t => t.content);

    // Get some subtopics for the first few main topics
    const subtopics = {};
    topics.filter(t => t.level === 2).forEach(t => {
        const parentTopic = t.path[1];
        if (!subtopics[parentTopic]) {
            subtopics[parentTopic] = [];
        }
        if (subtopics[parentTopic].length < 3) { // Limit to 3 subtopics per main topic
            subtopics[parentTopic].push(t.content);
        }
    });

    // Limit to 8 main topics to keep the diagram simple
    const topTopics = mainTopics.slice(0, 8);
    if (mainTopics.length > 8) {
        topTopics.push('...');
    }

    // Create a flowchart
    let flowchart = `flowchart TD\n  A[${rootTitle}]`;

    // Add connections to main topics
    let nodeCounter = 0;
    const nodeIds = {};

    // Add main topics
    for (let i = 0; i < topTopics.length; i++) {
        const topic = topTopics[i];
        const nodeId = String.fromCharCode(66 + i); // B, C, D, etc.
        nodeIds[topic] = nodeId;
        flowchart += `\n  A --> ${nodeId}[${topic}]`;

        // Add subtopics if available
        if (subtopics[topic] && subtopics[topic].length > 0) {
            for (let j = 0; j < subtopics[topic].length; j++) {
                const subtopic = subtopics[topic][j];
                const subNodeId = `${nodeId}${j+1}`;
                flowchart += `\n  ${nodeId} --> ${subNodeId}[${subtopic}]`;
            }
        }
    }

    return flowchart;
};

export default function MermaidDiagram({ chart, className = '', config = {} }) {
    const [svg, setSvg] = useState('');
    const [error, setError] = useState(null);
    const [currentTheme, setCurrentTheme] = useState(isDarkMode() ? 'dark' : 'default');
    const mermaidRef = useRef(null);
    const uniqueId = useRef(`mermaid-${Math.random().toString(36).substring(2, 11)}`);

    // Listen for theme changes
    useEffect(() => {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    const newTheme = isDarkMode() ? 'dark' : 'default';
                    if (newTheme !== currentTheme) {
                        setCurrentTheme(newTheme);
                    }
                }
            });
        });

        observer.observe(window.document.documentElement, { attributes: true });

        return () => observer.disconnect();
    }, [currentTheme]);

    // Apply configuration and render chart
    useEffect(() => {
        // Apply any custom configuration
        const mergedConfig = {
            startOnLoad: false,
            theme: config.theme || currentTheme,
            securityLevel: 'loose',
            logLevel: 'error',
            ...config
        };

        // Re-initialize mermaid with the merged configuration
        mermaid.initialize(mergedConfig);

        const renderChart = async () => {
            if (!chart) return;

            try {
                setError(null);

                // Clean up any previous renderings
                if (mermaidRef.current) {
                    mermaidRef.current.innerHTML = '';
                }

                // Simplify and fix the chart if needed
                let processedChart = chart;

                // Special handling for mindmaps with sub() syntax
                if (chart.includes('mindmap') && chart.includes('sub(')) {
                    try {
                        // First try direct conversion to standard mindmap format
                        processedChart = convertSubMindmapToStandard(chart);
                        console.log('Converted sub() mindmap to standard format');
                    } catch (error) {
                        console.error('Error converting mindmap format:', error);
                        // If that fails, try to simplify
                        processedChart = simplifyDiagram(chart);
                    }
                } else {
                    // For other diagrams, use general simplification
                    processedChart = simplifyDiagram(processedChart);
                }

                // Log the chart for debugging
                console.log('Rendering chart:', processedChart);

                // Create a container for rendering
                const container = document.createElement('div');
                container.style.display = 'none';
                document.body.appendChild(container);

                try {
                    // Render the chart
                    const { svg } = await mermaid.render(uniqueId.current, processedChart, container);
                    setSvg(svg);
                } finally {
                    // Clean up the container
                    document.body.removeChild(container);
                }
            } catch (err) {
                console.error('Mermaid rendering error:', err);

                // Provide specific error messages based on the error and chart type
                if (err.message && err.message.includes('Could not find a suitable point')) {
                    setError('The diagram is too complex to render. A simplified version will be shown instead.');
                } else if (err.message && err.message.includes('transform: Expected number')) {
                    setError('There was an issue with diagram layout. A simplified version will be shown instead.');
                } else if (chart.includes('mindmap') && chart.includes('sub(')) {
                    setError('The mindmap syntax appears to be using sub() which may not be supported. We attempted to fix it automatically, but there might still be issues. A simplified version will be shown instead.');

                    // Try to convert to flowchart as a last resort
                    try {
                        const flowchart = convertMindmapToFlowchart(chart);
                        setSvg(null); // Clear any partial SVG
                        setError('Converting mindmap to flowchart for better compatibility...');

                        // Render the flowchart after a short delay
                        setTimeout(() => {
                            const container = document.createElement('div');
                            container.style.display = 'none';
                            document.body.appendChild(container);

                            try {
                                mermaid.render(`mermaid-${Date.now()}`, flowchart, container)
                                    .then(({ svg }) => {
                                        setSvg(svg);
                                        setError(null);
                                    })
                                    .catch(() => {
                                        setError('Could not render the mindmap. A simplified version will be shown instead.');
                                    });
                            } finally {
                                document.body.removeChild(container);
                            }
                        }, 500);
                    } catch (conversionError) {
                        console.error('Error converting mindmap to flowchart:', conversionError);
                    }
                } else if (chart.includes('mindmap')) {
                    setError('There was an error rendering the mindmap. Mindmaps can be complex - try simplifying it or using a different diagram type.');
                } else if ((chart.includes('flowchart') || chart.includes('graph')) && chart.split('\n').length > 20) {
                    setError('This flowchart is too complex to render properly. A simplified version will be shown instead.');
                } else {
                    setError(`Failed to render diagram: ${err instanceof Error ? err.message : 'Unknown error'}`);
                }
            }
        };

        renderChart();
    }, [chart, config, currentTheme]);

    // Create a simplified version of the chart for fallback
    const createSimplifiedChart = (chart) => {
        // Special handling for mindmaps with sub() syntax
        if (chart.includes('mindmap') && chart.includes('sub(')) {
            try {
                // Extract the root title for a better fallback diagram
                const rootMatch = chart.match(/root\(\(([^)]+)\)\)/);
                const rootTitle = rootMatch ? rootMatch[1] : 'Main Topic';

                // Create a simple flowchart with the main topics
                return convertMindmapToFlowchart(chart);
            } catch (error) {
                console.error('Error creating simplified mindmap:', error);
                // Very simple fallback
                return 'flowchart TD\n  A[Software Engineering] --> B[Key Concepts]\n  A --> C[Principles]\n  A --> D[Lifecycle]';
            }
        }

        // For other diagrams, try our general simplification
        const simplified = simplifyDiagram(chart);

        // If the chart is still the same, apply more aggressive simplification
        if (simplified === chart) {
            if (chart.includes('mindmap')) {
                return convertMindmapToFlowchart(chart);
            } else if (chart.includes('flowchart') || chart.includes('graph')) {
                // Create a very basic flowchart with just a few nodes
                return 'flowchart TD\n  A[Main] --> B[Process]\n  B --> C[Result]';
            } else if (chart.includes('sequenceDiagram')) {
                // Create a simplified sequence diagram
                return 'sequenceDiagram\n  participant A as System\n  participant B as User\n  A->>B: Process Document\n  B-->>A: Acknowledge';
            } else if (chart.includes('classDiagram')) {
                // Create a simplified class diagram
                return 'classDiagram\n  class Document {\n    +String title\n    +process()\n  }';
            } else if (chart.includes('erDiagram')) {
                // Create a simplified ER diagram
                return 'erDiagram\n  DOCUMENT ||--o{ SECTION : contains';
            }
        }
        return simplified;
    };

    if (error) {
        const simplifiedChart = createSimplifiedChart(chart);

        return (
            <div className="space-y-4">
                <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
                    <p className="font-medium">Error rendering diagram</p>
                    <p>{error}</p>
                    <p className="mt-2 text-xs">Try selecting a different diagram type or refreshing the page.</p>
                </div>

                {/* Try to render a simplified version */}
                <div className="rounded-md border p-4">
                    <p className="mb-2 text-sm font-medium">Simplified Diagram:</p>
                    <div className="mermaid" key={`simplified-${Date.now()}`}>{simplifiedChart}</div>
                </div>

                <details className="rounded-md border p-2">
                    <summary className="cursor-pointer text-sm font-medium">Show diagram code</summary>
                    <pre className="mt-2 overflow-x-auto rounded bg-gray-100 p-2 text-xs dark:bg-gray-900">
                        {chart}
                    </pre>
                </details>
            </div>
        );
    }

    return (
        <div className={`mermaid-diagram ${className}`}>
            {svg ? (
                <div dangerouslySetInnerHTML={{ __html: svg }} />
            ) : (
                <>
                    {/* Fallback rendering method */}
                    <div className="mermaid" key={`fallback-${Date.now()}`}>{simplifyDiagram(fixMindmapSyntax(chart))}</div>

                    {/* Loading spinner */}
                    <div className="flex items-center justify-center p-8">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-500"></div>
                    </div>
                </>
            )}
            <div ref={mermaidRef} className="hidden" />
        </div>
    );
}
