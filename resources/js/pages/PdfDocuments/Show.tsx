import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import MermaidDiagram from '@/components/MermaidDiagram';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import TextExplanationSidebar from '@/components/TextExplanationSidebar';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Download, GraduationCap, MoreVertical, RefreshCw, Trash2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

interface PdfDocument {
    id: number;
    title: string;
    filename: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    summary: string | null;
    created_at: string;
}

interface Props {
    document: PdfDocument;
    pdfUrl: string;
}

export default function Show({ document, pdfUrl }: Props) {
    const [diagramType, setDiagramType] = useState<string>('mindmap');
    const [isGeneratingDiagram, setIsGeneratingDiagram] = useState<boolean>(false);
    const [diagramData, setDiagramData] = useState<any>(null);
    const [diagramError, setDiagramError] = useState<string | null>(null);

    // Text explanation sidebar state
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
    const [selectedText, setSelectedText] = useState<string>('');
    const [manualText, setManualText] = useState<string>('');
    const [showTextInput, setShowTextInput] = useState<boolean>(false);
    const pdfIframeRef = useRef<HTMLIFrameElement | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'PDF Documents',
            href: '/pdf-documents',
        },
        {
            title: document.title,
            href: `/pdf-documents/${document.id}`,
        },
    ];

    // Extract Mermaid diagram code from summary if it exists
    useEffect(() => {
        if (document.summary) {
            // Look for Mermaid code blocks in the summary
            const mermaidMatch = document.summary.match(/```mermaid\n([\s\S]*?)\n```/);
            if (mermaidMatch && mermaidMatch[1]) {
                const diagramCode = mermaidMatch[1].trim();
                console.log('Found diagram in summary:', diagramCode);

                // Determine diagram type from the code
                let detectedType = 'mindmap';
                if (diagramCode.startsWith('flowchart')) detectedType = 'flowchart';
                else if (diagramCode.startsWith('sequenceDiagram')) detectedType = 'sequenceDiagram';
                else if (diagramCode.startsWith('classDiagram')) detectedType = 'classDiagram';
                else if (diagramCode.startsWith('erDiagram')) detectedType = 'erDiagram';
                else if (diagramCode.startsWith('gantt')) detectedType = 'gantt';
                else if (diagramCode.startsWith('pie')) detectedType = 'pie';

                // Update the diagram type in the UI
                setDiagramType(detectedType);

                setDiagramData({
                    diagram_code: diagramCode,
                    explanation: 'Diagram extracted from summary',
                    interpretation: 'This diagram was automatically generated during document processing.'
                });
            } else {
                console.log('No diagram found in summary');
            }
        }
    }, [document.summary]);

    // We're not using the automatic text selection anymore since we're using a manual approach
    // with the textarea input instead

    // Function to generate a new diagram
    const generateDiagram = async () => {
        setIsGeneratingDiagram(true);
        setDiagramError(null);

        try {
            // Get CSRF token
            const csrfToken = window.document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

            console.log('Generating diagram of type:', diagramType);

            const response = await fetch(route('pdf-documents.diagrams', document.id), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ diagram_type: diagramType }),
            });

            const data = await response.json();
            console.log('Diagram generation response:', data);

            if (response.ok && data.success) {
                // Log the diagram code for debugging
                console.log('Received diagram code:', data.diagram.diagram_code);

                setDiagramData(data.diagram);
            } else {
                setDiagramError(data.error || 'Failed to generate diagram');
            }
        } catch (error) {
            console.error('Error generating diagram:', error);
            setDiagramError('An error occurred while generating the diagram');
        } finally {
            setIsGeneratingDiagram(false);
        }
    };

    // Handle closing the sidebar
    const handleCloseSidebar = () => {
        setIsSidebarOpen(false);
        setSelectedText('');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={document.title} />
            <div className="flex flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/pdf-documents">
                                <ArrowLeft className="mr-1 h-4 w-4" />
                                Back
                            </Link>
                        </Button>
                        <h1 className="text-2xl font-semibold">{document.title}</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        {document.status === 'completed' && (
                            <Button size="sm" asChild>
                                <Link href={`/pdf-documents/${document.id}/quizzes/create`}>
                                    <GraduationCap className="mr-1 h-4 w-4" />
                                    Create Quiz
                                </Link>
                            </Button>
                        )}
                        <Button variant="outline" size="sm" asChild>
                            <a href={pdfUrl} download={document.filename} target="_blank" rel="noopener noreferrer">
                                <Download className="mr-1 h-4 w-4" />
                                Download PDF
                            </a>
                        </Button>

                        <DocumentActions document={document} />
                    </div>
                </div>

                {/* Text Explanation Sidebar */}
                <TextExplanationSidebar
                    isOpen={isSidebarOpen}
                    onClose={handleCloseSidebar}
                    selectedText={selectedText}
                    documentId={document.id}
                />

                <div className="grid gap-6 md:grid-cols-2">
                    <div className="flex flex-col gap-4">
                        <div className="rounded-lg border">
                            <div className="border-b bg-gray-50 p-4 dark:bg-gray-900">
                                <h2 className="text-lg font-medium">PDF Preview</h2>
                            </div>
                            <div className="flex flex-col gap-2">
                                <div className="aspect-[3/4] p-4">
                                    <iframe
                                        ref={pdfIframeRef}
                                        src={`${pdfUrl}#toolbar=0`}
                                        className="h-full w-full rounded border"
                                        title={document.title}
                                    />
                                </div>
                                <div className="flex flex-col gap-2 px-4 pb-4">
                                    {showTextInput ? (
                                        <div className="flex flex-col gap-2">
                                            <textarea
                                                value={manualText}
                                                onChange={(e) => setManualText(e.target.value)}
                                                placeholder="Copy and paste text from the PDF that you want explained..."
                                                className="h-24 w-full rounded-md border border-gray-300 p-2 text-sm"
                                            />
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    onClick={() => setShowTextInput(false)}
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    onClick={() => {
                                                        if (manualText.trim().length > 5) {
                                                            setSelectedText(manualText);
                                                            setIsSidebarOpen(true);
                                                            setShowTextInput(false);
                                                        } else {
                                                            alert('Please enter at least 5 characters of text to get an explanation.');
                                                        }
                                                    }}
                                                    size="sm"
                                                >
                                                    Get Explanation
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex justify-center">
                                            <Button
                                                onClick={() => {
                                                    setShowTextInput(true);
                                                    setManualText('');
                                                }}
                                                variant="outline"
                                                size="sm"
                                            >
                                                Explain Text from PDF
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="rounded-lg border">
                            <div className="border-b bg-gray-50 p-4 dark:bg-gray-900">
                                <h2 className="text-lg font-medium">AI Summary</h2>
                                <div className="mt-1">
                                    <span
                                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                            document.status === 'completed'
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                                : document.status === 'processing'
                                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                                                : document.status === 'failed'
                                                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                                        }`}
                                    >
                                        {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
                                    </span>
                                </div>
                            </div>
                            <div className="p-4">
                                {document.status === 'completed' ? (
                                    <div className="prose max-w-none dark:prose-invert">
                                        <MarkdownRenderer content={document.summary} />
                                    </div>
                                ) : document.status === 'processing' ? (
                                    <div className="flex flex-col items-center justify-center py-8 text-center">
                                        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-500"></div>
                                        <p className="text-sm text-gray-500">Processing your document...</p>
                                        <p className="mt-2 text-xs text-gray-400">This may take a few moments</p>
                                        <p className="mt-4 text-xs text-gray-400">The AI is analyzing the content and generating a summary</p>
                                    </div>
                                ) : document.status === 'failed' ? (
                                    <div className="rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                                        <p>There was an error processing this document.</p>
                                        <p className="mt-2 text-sm">Please try uploading the document again or contact support if the issue persists.</p>
                                    </div>
                                ) : (
                                    <div className="rounded-lg bg-gray-50 p-4 text-gray-800 dark:bg-gray-900 dark:text-gray-300">
                                        <p>Waiting to process this document.</p>
                                        <p className="mt-2 text-sm">The document is in the queue and will be processed shortly.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                      {/**  <div className="rounded-lg border">
                            <div className="border-b bg-gray-50 p-4 dark:bg-gray-900">
                                <h2 className="text-lg font-medium">Visual Representation</h2>
                            </div>
                            <div className="p-4">
                                {document.status === 'completed' ? (
                                    <div>
                                        <div className="mb-4 flex items-center gap-4">
                                            <div className="flex-1">
                                                <Select
                                                    value={diagramType}
                                                    onValueChange={(value) => {
                                                        setDiagramType(value);
                                                        // Clear previous diagram data when changing type
                                                        setDiagramData(null);
                                                    }}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select diagram type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="mindmap">Mind Map</SelectItem>
                                                        <SelectItem value="flowchart">Flowchart</SelectItem>
                                                        <SelectItem value="sequenceDiagram">Sequence Diagram</SelectItem>
                                                        <SelectItem value="classDiagram">Class Diagram</SelectItem>
                                                        <SelectItem value="erDiagram">ER Diagram</SelectItem>
                                                        <SelectItem value="gantt">Gantt Chart</SelectItem>
                                                        <SelectItem value="pie">Pie Chart</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <Button
                                                onClick={generateDiagram}
                                                disabled={isGeneratingDiagram}
                                                size="sm"
                                            >
                                                {isGeneratingDiagram ? 'Generating...' : 'Generate Diagram'}
                                            </Button>
                                        </div>

                                        {diagramError && (
                                            <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
                                                <p>{diagramError}</p>
                                            </div>
                                        )}

                                        {diagramData ? (
                                            <div>
                                                {diagramData.explanation && (
                                                    <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">{diagramData.explanation}</p>
                                                )}

                                                <div className="relative rounded-md border p-4 dark:border-gray-700">
                                                    <MermaidDiagram
                                                        className=""
                                                        chart={diagramData.diagram_code}
                                                        config={{
                                                            theme: window.document.documentElement.classList.contains('dark') ? 'dark' : 'default',
                                                            fontFamily: 'Instrument Sans, sans-serif'
                                                        }}
                                                    />
                                                </div>

                                                {diagramData.interpretation && (
                                                    <p className="mt-4 text-sm italic text-gray-600 dark:text-gray-400">
                                                        <strong>How to interpret:</strong> {diagramData.interpretation}
                                                    </p>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="rounded-md border border-blue-200 bg-blue-50 p-4 text-sm text-blue-600 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-400">
                                                <p>Select a diagram type and click "Generate Diagram" to visualize the document content.</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="rounded-md border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
                                        <p>Diagrams will be available once the document processing is complete.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        */}

                        <div className="rounded-lg border p-4">
                            <h3 className="mb-2 font-medium">Document Information</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Filename:</span>
                                    <span>{document.filename}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Uploaded:</span>
                                    <span>{new Date(document.created_at).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

interface DocumentActionsProps {
    document: PdfDocument;
}

function DocumentActions({ document }: DocumentActionsProps) {
    const [showDiagramOptions, setShowDiagramOptions] = useState(false);
    const [selectedDiagramType, setSelectedDiagramType] = useState('mindmap');
    const [includeDiagram, setIncludeDiagram] = useState(true);

    const { processing: reprocessing, post: reprocessPost } = useForm();
    const { processing: deleting, delete: deleteDoc } = useForm();

    const handleReprocess = () => {
        if (showDiagramOptions) {
            // Create a FormData object
            const formData = new FormData();
            formData.append('include_diagram', includeDiagram ? '1' : '0');
            formData.append('diagram_type', selectedDiagramType);

            // Use the form data directly
            fetch(route('pdf-documents.reprocess', document.id), {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': window.document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: formData
            }).then(() => {
                // Reload the page after successful reprocessing
                window.location.reload();
            }).catch(error => {
                console.error('Error reprocessing document:', error);
                alert('Failed to reprocess document. Please try again.');
            });
        } else {
            reprocessPost(route('pdf-documents.reprocess', document.id));
        }
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this document?')) {
            deleteDoc(route('pdf-documents.destroy', document.id));
        }
    };

    const toggleDiagramOptions = () => {
        setShowDiagramOptions(!showDiagramOptions);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Actions</span>
                </Button>
            </DropdownMenuTrigger>
            {/**
            <DropdownMenuContent align="end">
                {!showDiagramOptions ? (
                    <DropdownMenuItem
                        onClick={toggleDiagramOptions}
                        disabled={reprocessing || document.status === 'processing'}
                        className="cursor-pointer"
                    >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Reprocess with AI
                    </DropdownMenuItem>
                ) : (
                    <>
                        <div className="px-2 py-1.5 text-sm font-semibold">
                            Reprocess Options
                        </div>
                        <div className="px-2 py-1.5">
                            <div className="mb-2">
                                <label className="mb-1 block text-xs">Diagram Type</label>
                                <Select
                                    value={selectedDiagramType}
                                    onValueChange={setSelectedDiagramType}
                                >
                                    <SelectTrigger className="h-8 text-xs">
                                        <SelectValue placeholder="Select diagram type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="mindmap">Mind Map</SelectItem>
                                        <SelectItem value="flowchart">Flowchart</SelectItem>
                                        <SelectItem value="sequenceDiagram">Sequence Diagram</SelectItem>
                                        <SelectItem value="classDiagram">Class Diagram</SelectItem>
                                        <SelectItem value="erDiagram">ER Diagram</SelectItem>
                                        <SelectItem value="gantt">Gantt Chart</SelectItem>
                                        <SelectItem value="pie">Pie Chart</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="mb-2 flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="include-diagram"
                                    checked={includeDiagram}
                                    onChange={(e) => setIncludeDiagram(e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300"
                                />
                                <label htmlFor="include-diagram" className="text-xs">
                                    Include diagram in summary
                                </label>
                            </div>
                        </div>
                        <DropdownMenuItem
                            onClick={handleReprocess}
                            disabled={reprocessing}
                            className="cursor-pointer"
                        >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            {reprocessing ? 'Reprocessing...' : 'Start Reprocessing'}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={toggleDiagramOptions}
                            className="cursor-pointer"
                        >
                            Cancel
                        </DropdownMenuItem>
                    </>
                )}
                <DropdownMenuItem
                    onClick={handleDelete}
                    disabled={deleting}
                    className="cursor-pointer text-red-600 focus:text-red-600"
                >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {deleting ? 'Deleting...' : 'Delete Document'}
                </DropdownMenuItem>
            </DropdownMenuContent>
            */}
        </DropdownMenu>
    );
}
