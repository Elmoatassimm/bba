import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, BookOpen, ExternalLink, FileText, GraduationCap } from 'lucide-react';
import { useEffect, useState } from 'react';

interface LearningResource {
  id: number;
  learning_plan_id: number;
  topic: string;
  description: string;
  resource_url: string | null;
  resource_type: string | null;
  priority: number;
  created_at: string;
}

interface LearningPlan {
  id: number;
  quiz_attempt_id: number;
  user_id: number;
  title: string;
  summary: string | null;
  roadmap: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  resources: LearningResource[];
}

interface QuizAttempt {
  id: number;
  quiz_id: number;
  score: number;
  total_questions: number;
}

interface Quiz {
  id: number;
  title: string;
  pdf_document_id: number;
}

interface PdfDocument {
  id: number;
  title: string;
}

interface Props {
  learningPlan: LearningPlan;
  quizAttempt: QuizAttempt;
  quiz: Quiz;
  document: PdfDocument;
}

export default function Show({ learningPlan, quizAttempt, quiz, document }: Props) {
  const [resourcesByTopic, setResourcesByTopic] = useState<Record<string, LearningResource[]>>({});

  // Debug the learning plan data
  useEffect(() => {
    console.log('Learning Plan Data:', learningPlan);
    console.log('Roadmap Data:', learningPlan.roadmap);
  }, [learningPlan]);

  // Format mermaid diagram content with proper newlines
  const formatMermaidDiagram = (content: string): string => {
    if (!content) return '';

    // If the content already has newlines, return it as is
    if (content.includes('\n')) return content;

    // For mindmap diagrams, ensure proper formatting
    if (content.startsWith('mindmap')) {
      // Simple approach: just add newlines after specific keywords
      let result = 'mindmap\n';

      // Extract the root node
      const rootMatch = content.match(/root\(\([^)]+\)\)/);
      if (rootMatch) {
        result += `  ${rootMatch[0]}\n`;

        // Remove the matched part from content for further processing
        content = content.replace(rootMatch[0], '');
      }

      // Process the rest of the content
      const mainTopics = ['Basic Concepts', 'Advanced Topics', 'Practical Applications', 'Master Subject'];
      const subtopics = ['Introduction', 'Key Terminology', 'Fundamental Principles',
                         'Detailed Analysis', 'Case Studies', 'Research Methods',
                         'Hands-on Exercises', 'Real-world Examples', 'Problem Solving',
                         'Final Assessment', 'Ongoing Practice'];

      // Add main topics with proper indentation
      for (const topic of mainTopics) {
        if (content.includes(topic)) {
          result += `    ${topic}\n`;

          // Add subtopics for this main topic
          for (const subtopic of subtopics) {
            if (content.includes(subtopic)) {
              result += `      ${subtopic}\n`;
            }
          }
        }
      }

      return result;
    }

    return content;
  };

  // Use a simpler approach to render diagrams
  useEffect(() => {
    // Log the roadmap content for debugging
    console.log('Roadmap content:', learningPlan.roadmap);

    // Format the roadmap content if needed
    if (learningPlan.roadmap && !learningPlan.roadmap.includes('\n')) {
      const formattedRoadmap = formatMermaidDiagram(learningPlan.roadmap);
      console.log('Formatted roadmap:', formattedRoadmap);

      // Find the mermaid container and update its content
      const mermaidContainer = window.document.querySelector('.mermaid');
      if (mermaidContainer) {
        mermaidContainer.textContent = formattedRoadmap;
        console.log('Updated mermaid container with formatted content');
      }
    }

    // Let the global mermaid script handle the rendering
  }, [learningPlan.roadmap]);

  // Group resources by topic
  useEffect(() => {
    const grouped = learningPlan.resources.reduce((acc, resource) => {
      if (!acc[resource.topic]) {
        acc[resource.topic] = [];
      }
      acc[resource.topic].push(resource);
      return acc;
    }, {} as Record<string, LearningResource[]>);

    setResourcesByTopic(grouped);
  }, [learningPlan.resources]);

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: 'Dashboard',
      href: '/dashboard',
    },
    {
      title: 'Learning Plans',
      href: '/learning-plans',
    },
    {
      title: learningPlan.title,
      href: `/learning-plans/${learningPlan.id}`,
    },
  ];

  const getResourceTypeIcon = (type: string | null) => {
    switch (type) {
      case 'article':
        return <FileText className="h-4 w-4 mr-2" />;
      case 'video':
        return <BookOpen className="h-4 w-4 mr-2" />;
      case 'book':
        return <BookOpen className="h-4 w-4 mr-2" />;
      default:
        return <FileText className="h-4 w-4 mr-2" />;
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={learningPlan.title} />

      <div className="container py-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Link href="/learning-plans">
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Learning Plans
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">{learningPlan.title}</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
                <TabsTrigger value="roadmap">Learning Roadmap</TabsTrigger>
              </TabsList>
              <TabsContent value="summary" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Learning Plan Summary</CardTitle>
                    <CardDescription>
                      Based on your quiz performance on "{quiz.title}"
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="prose dark:prose-invert max-w-none">
                      <p>{learningPlan.summary || 'No summary available.'}</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="resources" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Learning Resources</CardTitle>
                    <CardDescription>
                      Recommended resources to improve your knowledge
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {Object.keys(resourcesByTopic).length === 0 ? (
                      <div className="text-center py-6">
                        <GraduationCap className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                          No resources available
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                          There are no learning resources available for this plan.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {Object.entries(resourcesByTopic).map(([topic, resources]) => (
                          <div key={topic} className="border rounded-lg p-4">
                            <h3 className="text-lg font-medium mb-2">{topic}</h3>
                            <div className="space-y-4">
                              {resources.map((resource) => (
                                <div key={resource.id} className="border-t pt-4 first:border-t-0 first:pt-0">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <div className="font-medium">{resource.description}</div>
                                      {resource.resource_url && (
                                        <a
                                          href={resource.resource_url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-primary hover:underline flex items-center mt-1 text-sm"
                                        >
                                          {getResourceTypeIcon(resource.resource_type)}
                                          {resource.resource_type || 'Resource'}{' '}
                                          <ExternalLink className="h-3 w-3 ml-1" />
                                        </a>
                                      )}
                                    </div>
                                    {resource.priority && (
                                      <div className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                                        Priority {resource.priority}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="roadmap" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Learning Roadmap</CardTitle>
                    <CardDescription>
                      Visual guide to improve your knowledge
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="prose dark:prose-invert max-w-none">
                      <div className="my-4 p-4 border rounded-md bg-white dark:bg-gray-800">
                        <div className="mermaid">
{learningPlan.roadmap || `mindmap
  root((Learning Path))
    Basic Concepts
      Introduction
      Key Terminology
      Fundamental Principles
    Advanced Topics
      Detailed Analysis
      Case Studies
      Research Methods
    Practical Applications
      Hands-on Exercises
      Real-world Examples
      Problem Solving
    Master Subject
      Final Assessment
      Ongoing Practice`}
                        </div>
                      </div>
                      <details className="mt-4">
                        <summary className="cursor-pointer text-sm font-medium">Show diagram code</summary>
                        <pre className="mt-2 overflow-x-auto rounded bg-gray-100 p-2 text-xs dark:bg-gray-900">
                          {learningPlan.roadmap || 'Default roadmap is being displayed because no custom roadmap was generated.'}
                        </pre>
                      </details>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Quiz Performance</CardTitle>
                <CardDescription>
                  Your performance on the quiz
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Score
                    </div>
                    <div className="text-2xl font-bold">
                      {quizAttempt.score}/{quizAttempt.total_questions}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {Math.round((quizAttempt.score / quizAttempt.total_questions) * 100)}%
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Document
                    </div>
                    <div className="font-medium">{document.title}</div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Quiz
                    </div>
                    <div className="font-medium">{quiz.title}</div>
                  </div>

                  <div className="pt-4">
                    <Link href={`/quiz-attempts/${quizAttempt.id}/results`}>
                      <Button variant="outline" className="w-full">
                        <GraduationCap className="mr-2 h-4 w-4" />
                        View Quiz Results
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
