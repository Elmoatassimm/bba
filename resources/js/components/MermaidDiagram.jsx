import React, { useState, useEffect } from 'react';
import { Maximize2, RefreshCw } from 'lucide-react';
import mermaid from 'mermaid';
import MermaidRenderer from './MermaidRenderer.jsx';
import ErrorBoundary from './ErrorBoundary.jsx';

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
    let previousLevel = 0;

    // First pass: determine the structure
    const structure = [];
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        if (line.startsWith('mindmap')) {
            structure.push({ level: 0, content: line, type: 'header' });
        } else if (line.startsWith('root((')) {
            structure.push({ level: 1, content: line, type: 'root' });
        } else if (line.startsWith('sub(')) {
            // Extract the content from sub("content")
            const match = line.match(/sub\("(.+?)"\)/);
            if (match && match[1]) {
                const content = match[1];

                // Determine level based on context
                let level;
                if (i > 0 && structure.length > 0) {
                    const prevItem = structure[structure.length - 1];

                    // If previous item was also a sub(), it's either a sibling or a child
                    if (prevItem.type === 'sub') {
                        // Look ahead to see if next item is also a sub()
                        const nextLine = i < lines.length - 1 ? lines[i + 1].trim() : '';
                        if (nextLine.startsWith('sub(')) {
                            // This is likely a sibling
                            level = prevItem.level;
                        } else {
                            // This is likely a child
                            level = prevItem.level + 1;
                        }
                    } else {
                        // If previous was not a sub(), this is a child of whatever came before
                        level = prevItem.level + 1;
                    }
                } else {
                    // Default to level 2 (child of root)
                    level = 2;
                }

                structure.push({ level, content, type: 'sub' });
            }
        } else if (line) {
            // Other content
            const lastLevel = structure.length > 0 ? structure[structure.length - 1].level : 0;
            structure.push({ level: lastLevel, content: line, type: 'other' });
        }
    }

    // Second pass: generate the mindmap with proper indentation
    for (const item of structure) {
        const indent = '  '.repeat(item.level);
        if (item.type === 'sub') {
            result.push(`${indent}${item.content}`);
        } else {
            result.push(`${indent}${item.content}`);
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

// Function to convert a flowchart to a mindmap
const convertFlowchartToMindmap = (chart) => {
    try {
        // Extract nodes and connections from the flowchart
        const lines = chart.split('\n');
        const nodes = {};
        const connections = [];
        let rootNodeId = null;

        // Find the first node as the root
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            // Skip empty lines and non-node/connection lines
            if (!line || line.startsWith('style') || line.startsWith('classDef')) continue;

            // Extract node definitions (e.g., A[Node Label])
            const nodeMatch = line.match(/^\s*([A-Za-z0-9]+)\s*\[([^\]]+)\]/);
            if (nodeMatch) {
                const id = nodeMatch[1];
                const label = nodeMatch[2];
                nodes[id] = label;

                // The first node is usually the root
                if (rootNodeId === null) {
                    rootNodeId = id;
                }
                continue;
            }

            // Extract connections (e.g., A --> B)
            const connectionMatch = line.match(/^\s*([A-Za-z0-9]+)\s*--+>\s*([A-Za-z0-9]+)/);
            if (connectionMatch) {
                connections.push({
                    from: connectionMatch[1],
                    to: connectionMatch[2]
                });
            }
        }

        // If no nodes found, return a simple mindmap
        if (Object.keys(nodes).length === 0) {
            return 'mindmap\n  root((Main Topic))\n    Topic 1\n    Topic 2\n    Topic 3';
        }

        // Build a tree structure from connections
        const tree = {};
        const visited = new Set();

        // Find the root node (node with no incoming connections)
        if (!rootNodeId) {
            const allNodes = new Set(Object.keys(nodes));
            const destinationNodes = new Set(connections.map(c => c.to));

            for (const node of allNodes) {
                if (!destinationNodes.has(node)) {
                    rootNodeId = node;
                    break;
                }
            }

            // If still no root found, use the first node
            if (!rootNodeId && allNodes.size > 0) {
                rootNodeId = Array.from(allNodes)[0];
            }
        }

        // Build the tree recursively
        function buildTree(nodeId) {
            if (visited.has(nodeId)) return;
            visited.add(nodeId);

            tree[nodeId] = [];

            for (const conn of connections) {
                if (conn.from === nodeId) {
                    tree[nodeId].push(conn.to);
                    buildTree(conn.to);
                }
            }
        }

        if (rootNodeId) {
            buildTree(rootNodeId);
        }

        // Convert the tree to a mindmap
        let mindmap = 'mindmap\n';

        // Add the root node
        if (rootNodeId && nodes[rootNodeId]) {
            mindmap += `  root((${nodes[rootNodeId]}))\n`;

            // Add first level children
            for (const childId of tree[rootNodeId] || []) {
                mindmap += `    ${nodes[childId]}\n`;

                // Add second level children (grandchildren)
                for (const grandchildId of tree[childId] || []) {
                    mindmap += `      ${nodes[grandchildId]}\n`;
                }
            }
        } else {
            // Fallback if no proper root found
            mindmap += '  root((Main Topic))\n    Topic 1\n    Topic 2\n    Topic 3';
        }

        return mindmap;
    } catch (error) {
        console.error('Error converting flowchart to mindmap:', error);
        return 'mindmap\n  root((Main Topic))\n    Topic 1\n    Topic 2\n    Topic 3';
    }
};

// Function to create a simple mindmap from any diagram type
const createSimpleMindmap = (chart) => {
    try {
        // Extract potential topic from the first few lines
        const lines = chart.split('\n');
        let mainTopic = 'Main Topic';

        // Look for potential titles or main concepts
        for (let i = 0; i < Math.min(5, lines.length); i++) {
            const line = lines[i].trim();

            // Look for title declarations
            const titleMatch = line.match(/title\s+(.+)$/);
            if (titleMatch) {
                mainTopic = titleMatch[1];
                break;
            }

            // Look for class or participant declarations
            const classMatch = line.match(/class\s+(\w+)/);
            if (classMatch) {
                mainTopic = classMatch[1];
                break;
            }

            // Look for entity declarations
            const entityMatch = line.match(/(\w+)\s+{/);
            if (entityMatch) {
                mainTopic = entityMatch[1];
                break;
            }
        }

        // Create a simple mindmap with the extracted topic
        let mindmap = `mindmap\n  root((${mainTopic}))\n`;

        // Add some generic topics
        mindmap += '    Overview\n';
        mindmap += '      Key Concepts\n';
        mindmap += '      Definitions\n';
        mindmap += '    Components\n';
        mindmap += '      Structure\n';
        mindmap += '      Relationships\n';
        mindmap += '    Applications\n';
        mindmap += '      Use Cases\n';
        mindmap += '      Examples\n';

        return mindmap;
    } catch (error) {
        console.error('Error creating simple mindmap:', error);
        return 'mindmap\n  root((Main Topic))\n    Topic 1\n    Topic 2\n    Topic 3';
    }
};

// Create a simplified version of the chart for fallback - always returns a mindmap
const createSimplifiedChart = (chart) => {
    // Special handling for mindmaps with sub() syntax
    if (chart.includes('mindmap') && chart.includes('sub(')) {
        try {
            // Extract the root title for a better fallback diagram
            const rootMatch = chart.match(/root\(\(([^)]+)\)\)/);
            const rootTitle = rootMatch ? rootMatch[1] : 'Main Topic';

            // Try to fix the mindmap syntax
            return fixMindmapSyntax(chart);
        } catch (error) {
            console.error('Error creating simplified mindmap:', error);
            // Very simple fallback mindmap
            return 'mindmap\n  root((Main Topic))\n    Key Concepts\n    Principles\n    Applications';
        }
    }

    // If it's already a mindmap, try to simplify it
    if (chart.includes('mindmap')) {
        try {
            // For complex mindmaps, create a simpler version
            if (chart.split('\n').length > 20) {
                // Extract the root title if possible
                const rootMatch = chart.match(/root\(\(([^)]+)\)\)/);
                const rootTitle = rootMatch ? rootMatch[1] : 'Main Topic';

                return `mindmap\n  root((${rootTitle}))\n    Key Concepts\n    Principles\n    Applications`;
            }

            // For simpler mindmaps, return as is
            return chart;
        } catch (error) {
            console.error('Error simplifying mindmap:', error);
            return 'mindmap\n  root((Main Topic))\n    Topic 1\n    Topic 2\n    Topic 3';
        }
    }

    // For any other diagram type, convert to a mindmap
    try {
        if (chart.includes('flowchart') || chart.includes('graph')) {
            // Convert flowchart to mindmap
            return convertFlowchartToMindmap(chart);
        } else {
            // For other diagrams, create a simple mindmap
            return createSimpleMindmap(chart);
        }
    } catch (error) {
        console.error('Error converting to mindmap:', error);
        // Default fallback mindmap
        return 'mindmap\n  root((Main Topic))\n    Topic 1\n    Topic 2\n    Topic 3';
    }
};

export default function MermaidDiagram({ chart, className = '', config = {} }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [renderAttempt, setRenderAttempt] = useState(0);
    const [error, setError] = useState(null);
    const [processedChart, setProcessedChart] = useState('');
    const [useDirectRendering, setUseDirectRendering] = useState(false);

    // Process the chart when it changes
    useEffect(() => {
        if (!chart) return;

        try {
            // Check if the chart is a mindmap
            if (chart.includes('mindmap')) {
                // Special handling for mindmaps with sub() syntax
                if (chart.includes('sub(')) {
                    try {
                        // First try direct conversion to standard mindmap format
                        const converted = convertSubMindmapToStandard(chart);
                        console.log('Converted sub() mindmap to standard format');

                        // For mindmaps, try direct rendering first
                        if (converted.split('\n').length < 50) {
                            setUseDirectRendering(true);
                        } else {
                            // For very complex mindmaps, use SVG rendering
                            setUseDirectRendering(false);
                        }

                        setProcessedChart(converted);
                    } catch (error) {
                        console.error('Error converting mindmap format:', error);
                        // If that fails, try to simplify
                        setProcessedChart(simplifyDiagram(chart));
                        setUseDirectRendering(false);
                    }
                } else {
                    // For standard mindmaps, use direct rendering
                    setProcessedChart(chart);
                    setUseDirectRendering(true);
                }
            } else {
                // For all other diagram types, preserve the original format
                console.log('Rendering original diagram format');

                // Use the original chart
                setProcessedChart(chart);

                // Use SVG rendering for non-mindmap diagrams
                setUseDirectRendering(false);
            }
        } catch (error) {
            console.error('Error processing chart:', error);
            // Create a fallback diagram - simple flowchart
            setProcessedChart('flowchart TD\n  A[Error] --> B[Please try again]');
            setUseDirectRendering(false);
        }
    }, [chart]);

    // Handle successful rendering
    const handleRenderSuccess = () => {
        setError(null);
    };

    // Handle rendering errors
    const handleRenderError = (err) => {
        console.error('Mermaid rendering error:', err);

        // Determine diagram type for better error messages
        let diagramType = 'diagram';
        if (chart.includes('mindmap')) diagramType = 'mindmap';
        else if (chart.includes('flowchart') || chart.includes('graph')) diagramType = 'flowchart';
        else if (chart.includes('sequenceDiagram')) diagramType = 'sequence diagram';
        else if (chart.includes('classDiagram')) diagramType = 'class diagram';
        else if (chart.includes('gantt')) diagramType = 'Gantt chart';
        else if (chart.includes('stateDiagram')) diagramType = 'state diagram';

        // Provide specific error messages based on the error and chart type
        if (err.message && err.message.includes('Could not find a suitable point')) {
            setError(`The ${diagramType} is too complex to render. A simplified version will be shown instead.`);
        } else if (err.message && err.message.includes('transform: Expected number')) {
            setError(`There was an issue with ${diagramType} layout. A simplified version will be shown instead.`);
        } else if (err.message && err.message.includes('Failed to execute \'removeChild\' on \'Node\'')) {
            setError(`There was an issue with the ${diagramType} rendering. Trying a different approach...`);
            // This is a DOM manipulation error, try again with a different approach
            setTimeout(() => {
                setUseDirectRendering(prev => !prev); // Toggle the rendering method
                setRenderAttempt(prev => prev + 1);
            }, 500);
        } else if (chart.includes('mindmap') && chart.includes('sub(')) {
            setError('The mindmap syntax appears to be using sub() which may not be supported. We attempted to fix it automatically, but there might still be issues.');
        } else {
            setError(`Failed to render ${diagramType}: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
    };

    // Handle retry
    const handleRetry = () => {
        setError(null);
        setRenderAttempt(prev => prev + 1);
    };

    // Expanded view component
    const ExpandedView = () => (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="relative h-[90vh] w-[90vw] rounded-lg bg-white p-6 shadow-xl dark:bg-gray-900">
                <button
                    onClick={() => setIsExpanded(false)}
                    className="absolute right-4 top-4 rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="sr-only">Close</span>
                </button>

                <h2 className="mb-4 text-xl font-semibold">Expanded Diagram View</h2>

                <div className="expanded-diagram h-[calc(90vh-120px)] overflow-auto">
                    <MermaidRenderer
                        chart={processedChart || chart}
                        config={{
                            ...config,
                            fontSize: 16,
                            useMaxWidth: false
                        }}
                        onRenderSuccess={handleRenderSuccess}
                        onRenderError={handleRenderError}
                    />
                </div>
            </div>
        </div>
    );

    // If there's an error, show the error and a simplified version
    if (error) {
        // Create a simple fallback diagram based on the original diagram type
        let simplifiedChart = 'flowchart TD\n  A[Error] --> B[Please try again]';
        let diagramType = 'diagram';

        if (chart.includes('mindmap')) {
            simplifiedChart = createSimplifiedChart(chart);
            diagramType = 'mindmap';
        } else if (chart.includes('flowchart') || chart.includes('graph')) {
            diagramType = 'flowchart';
        } else if (chart.includes('sequenceDiagram')) {
            diagramType = 'sequence diagram';
            simplifiedChart = 'sequenceDiagram\n  participant A\n  participant B\n  A->>B: Hello\n  B-->>A: Hi there';
        } else if (chart.includes('classDiagram')) {
            diagramType = 'class diagram';
            simplifiedChart = 'classDiagram\n  class A {\n    +String data\n  }\n  class B {\n    +method()\n  }';
        } else if (chart.includes('gantt')) {
            diagramType = 'Gantt chart';
            simplifiedChart = 'gantt\n  title Simple Gantt\n  dateFormat YYYY-MM-DD\n  section Section\n  Task 1 :a1, 2023-01-01, 7d';
        } else if (chart.includes('stateDiagram')) {
            diagramType = 'state diagram';
            simplifiedChart = 'stateDiagram-v2\n  [*] --> State1\n  State1 --> [*]';
        }

        return (
            <>
                {isExpanded && <ExpandedView />}

                <div className="space-y-4">
                    <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Error rendering {diagramType}</p>
                                <p>{error}</p>
                                <p className="mt-2 text-xs">Try refreshing the page or simplifying the diagram content.</p>
                            </div>
                            <button
                                onClick={handleRetry}
                                className="rounded-full bg-white/80 p-1.5 text-gray-600 shadow-sm hover:bg-white hover:text-gray-900 dark:bg-gray-800/80 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                                title="Retry rendering"
                            >
                                <RefreshCw className="h-4 w-4" />
                                <span className="sr-only">Retry rendering</span>
                            </button>
                        </div>
                    </div>

                    {/* Try to render a simplified version */}
                    <div className="rounded-md border p-4">
                        <div className="mb-2 flex items-center justify-between">
                            <p className="text-sm font-medium">Simplified {diagramType}:</p>
                            <button
                                onClick={() => setIsExpanded(true)}
                                className="rounded-full bg-white/80 p-1.5 text-gray-600 shadow-sm hover:bg-white hover:text-gray-900 dark:bg-gray-800/80 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                                title="Expand diagram"
                            >
                                <Maximize2 className="h-4 w-4" />
                                <span className="sr-only">Expand diagram</span>
                            </button>
                        </div>

                        <ErrorBoundary onReset={() => setRenderAttempt(prev => prev + 1)}>
                            <MermaidRenderer
                                chart={simplifiedChart}
                                key={`simplified-${renderAttempt}`}
                                config={config}
                                useDirectRendering={simplifiedChart.includes('mindmap')}
                            />
                        </ErrorBoundary>
                    </div>

                    <details className="rounded-md border p-2">
                        <summary className="cursor-pointer text-sm font-medium">Show diagram code</summary>
                        <pre className="mt-2 overflow-x-auto rounded bg-gray-100 p-2 text-xs dark:bg-gray-900">
                            {chart}
                        </pre>
                    </details>
                </div>
            </>
        );
    }

    // Normal rendering
    return (
        <>
            {isExpanded && <ExpandedView />}

            <div className={`mermaid-diagram relative ${className}`}>
                {/* Expand button */}
                <button
                    onClick={() => setIsExpanded(true)}
                    className="absolute right-2 top-2 z-10 rounded-full bg-white/80 p-1.5 text-gray-600 shadow-sm hover:bg-white hover:text-gray-900 dark:bg-gray-800/80 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                    title="Expand diagram"
                >
                    <Maximize2 className="h-4 w-4" />
                    <span className="sr-only">Expand diagram</span>
                </button>

                {/* Retry button */}
                <button
                    onClick={handleRetry}
                    className="absolute right-2 top-10 z-10 rounded-full bg-white/80 p-1.5 text-gray-600 shadow-sm hover:bg-white hover:text-gray-900 dark:bg-gray-800/80 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                    title="Retry rendering"
                >
                    <RefreshCw className="h-4 w-4" />
                    <span className="sr-only">Retry rendering</span>
                </button>

                <ErrorBoundary onReset={() => setRenderAttempt(prev => prev + 1)}>
                    <MermaidRenderer
                        chart={processedChart || chart}
                        key={`diagram-${renderAttempt}`}
                        config={config}
                        onRenderSuccess={handleRenderSuccess}
                        onRenderError={handleRenderError}
                        useDirectRendering={useDirectRendering}
                    />
                </ErrorBoundary>
            </div>
        </>
    );
}
