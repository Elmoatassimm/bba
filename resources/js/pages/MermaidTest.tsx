import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState, useEffect } from 'react';
import mermaid from 'mermaid';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
  },
  {
    title: 'Mermaid Test',
    href: '/mermaid-test',
  },
];

// Diagram definitions
const flowchartDiagram = `flowchart TD
  A[Start] --> B{Is it working?}
  B -->|Yes| C[Great!]
  B -->|No| D[Debug]
  D --> B
  C --> E[End]`;

const sequenceDiagram = `sequenceDiagram
  participant User
  participant System
  participant Database
  User->>System: Request data
  System->>Database: Query data
  Database-->>System: Return results
  System-->>User: Display results`;

const classDiagram = `classDiagram
  class Animal {
    +String name
    +makeSound()
  }
  class Dog {
    +fetch()
  }
  class Cat {
    +scratch()
  }
  Animal <|-- Dog
  Animal <|-- Cat`;

const mindmapDiagram = `mindmap
  root((Mermaid))
    Diagrams
      Flowchart
      Sequence
      Class
      State
      Entity Relationship
    Features
      Live Editor
      Themes
      Plugins
    Integration
      Markdown
      Websites
      Documentation`;

const ganttDiagram = `gantt
  title Project Schedule
  dateFormat YYYY-MM-DD
  section Planning
  Requirements gathering :a1, 2023-01-01, 7d
  Design                 :a2, after a1, 10d
  section Development
  Implementation         :a3, after a2, 15d
  Testing                :a4, after a3, 7d
  section Deployment
  Deployment             :a5, after a4, 3d`;

const stateDiagram = `stateDiagram-v2
  [*] --> Idle
  Idle --> Processing: Start
  Processing --> Complete: Success
  Processing --> Error: Failure
  Complete --> [*]
  Error --> Idle: Retry`;

const clickableDiagram = `flowchart LR
  A[Click me] --> B{Decision}
  B -->|Yes| C(Result)
  B -->|No| D(Alternative)
  click A href "https://mermaid.js.org" "Open Mermaid documentation" _blank
  click C href "#" "This is a tooltip"`;

export default function MermaidTest() {
  const [activeTab, setActiveTab] = useState('flowchart');
  
  // Initialize mermaid and render diagrams when component mounts or tab changes
  useEffect(() => {
    const renderDiagrams = async () => {
      try {
        // Make sure mermaid is initialized with proper configuration
        mermaid.initialize({
          startOnLoad: false,
          theme: document.documentElement.classList.contains('dark') ? 'dark' : 'default',
          securityLevel: 'loose', // Required for clickable diagrams
          fontFamily: 'Instrument Sans, sans-serif',
          flowchart: {
            useMaxWidth: false,
            htmlLabels: true,
            curve: 'basis'
          },
          sequence: {
            showSequenceNumbers: true,
            actorMargin: 80
          },
          mindmap: {
            padding: 20,
            maxNodeWidth: 200
          }
        });

        // Render all diagrams
        await mermaid.run({
          querySelector: '.mermaid'
        });
      } catch (error) {
        console.error('Error rendering mermaid diagrams:', error);
      }
    };

    // Render diagrams after a short delay to ensure DOM is ready
    const timer = setTimeout(() => {
      renderDiagrams();
    }, 100);

    return () => clearTimeout(timer);
  }, [activeTab]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Mermaid Test" />

      <div className="container py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Mermaid Diagram Test</h1>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Mermaid.js Diagram Examples</CardTitle>
            <CardDescription>
              Examples of different diagram types supported by Mermaid.js
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="flowchart" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="flowchart">Flowchart</TabsTrigger>
                <TabsTrigger value="sequence">Sequence</TabsTrigger>
                <TabsTrigger value="class">Class</TabsTrigger>
                <TabsTrigger value="mindmap">Mindmap</TabsTrigger>
                <TabsTrigger value="gantt">Gantt</TabsTrigger>
                <TabsTrigger value="state">State</TabsTrigger>
              </TabsList>
              
              <TabsContent value="flowchart">
                <div className="prose dark:prose-invert max-w-none">
                  <h3>Flowchart Diagram</h3>
                  <p>Flowcharts are diagrams that represent workflows or processes.</p>
                  <div className="my-4 p-4 border rounded-md bg-white dark:bg-gray-800">
                    <div className="mermaid">{flowchartDiagram}</div>
                  </div>
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm font-medium">Show diagram code</summary>
                    <pre className="mt-2 overflow-x-auto rounded bg-gray-100 p-2 text-xs dark:bg-gray-900">
                      {flowchartDiagram}
                    </pre>
                  </details>
                </div>
              </TabsContent>
              
              <TabsContent value="sequence">
                <div className="prose dark:prose-invert max-w-none">
                  <h3>Sequence Diagram</h3>
                  <p>Sequence diagrams show how processes operate with one another and in what order.</p>
                  <div className="my-4 p-4 border rounded-md bg-white dark:bg-gray-800">
                    <div className="mermaid">{sequenceDiagram}</div>
                  </div>
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm font-medium">Show diagram code</summary>
                    <pre className="mt-2 overflow-x-auto rounded bg-gray-100 p-2 text-xs dark:bg-gray-900">
                      {sequenceDiagram}
                    </pre>
                  </details>
                </div>
              </TabsContent>
              
              <TabsContent value="class">
                <div className="prose dark:prose-invert max-w-none">
                  <h3>Class Diagram</h3>
                  <p>Class diagrams are used in object-oriented modeling to show classes and their relationships.</p>
                  <div className="my-4 p-4 border rounded-md bg-white dark:bg-gray-800">
                    <div className="mermaid">{classDiagram}</div>
                  </div>
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm font-medium">Show diagram code</summary>
                    <pre className="mt-2 overflow-x-auto rounded bg-gray-100 p-2 text-xs dark:bg-gray-900">
                      {classDiagram}
                    </pre>
                  </details>
                </div>
              </TabsContent>
              
              <TabsContent value="mindmap">
                <div className="prose dark:prose-invert max-w-none">
                  <h3>Mindmap Diagram</h3>
                  <p>Mindmaps are diagrams used to visually organize information hierarchically.</p>
                  <div className="my-4 p-4 border rounded-md bg-white dark:bg-gray-800">
                    <div className="mermaid">{mindmapDiagram}</div>
                  </div>
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm font-medium">Show diagram code</summary>
                    <pre className="mt-2 overflow-x-auto rounded bg-gray-100 p-2 text-xs dark:bg-gray-900">
                      {mindmapDiagram}
                    </pre>
                  </details>
                </div>
              </TabsContent>
              
              <TabsContent value="gantt">
                <div className="prose dark:prose-invert max-w-none">
                  <h3>Gantt Chart</h3>
                  <p>Gantt charts illustrate project schedules with start and finish dates of elements.</p>
                  <div className="my-4 p-4 border rounded-md bg-white dark:bg-gray-800">
                    <div className="mermaid">{ganttDiagram}</div>
                  </div>
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm font-medium">Show diagram code</summary>
                    <pre className="mt-2 overflow-x-auto rounded bg-gray-100 p-2 text-xs dark:bg-gray-900">
                      {ganttDiagram}
                    </pre>
                  </details>
                </div>
              </TabsContent>
              
              <TabsContent value="state">
                <div className="prose dark:prose-invert max-w-none">
                  <h3>State Diagram</h3>
                  <p>State diagrams describe the behavior of a system, showing state transitions.</p>
                  <div className="my-4 p-4 border rounded-md bg-white dark:bg-gray-800">
                    <div className="mermaid">{stateDiagram}</div>
                  </div>
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm font-medium">Show diagram code</summary>
                    <pre className="mt-2 overflow-x-auto rounded bg-gray-100 p-2 text-xs dark:bg-gray-900">
                      {stateDiagram}
                    </pre>
                  </details>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Interactive Features</CardTitle>
            <CardDescription>
              Demonstration of interactive features like click events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose dark:prose-invert max-w-none">
              <p>
                You can add click events to nodes in diagrams. The example below has clickable nodes.
              </p>
              
              <h3 className="mt-6">Clickable Flowchart Example</h3>
              <div className="my-4 p-4 border rounded-md bg-white dark:bg-gray-800">
                <div className="mermaid">{clickableDiagram}</div>
              </div>
              <p className="text-sm mt-2">
                <em>Note: The node "Click me" is linked to the Mermaid.js documentation.</em>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
