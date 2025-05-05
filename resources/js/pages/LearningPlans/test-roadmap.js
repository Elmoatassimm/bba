// This is a test script to generate a roadmap for a learning plan
// Run this in the browser console to test the roadmap rendering

// Sample roadmap diagram
const testRoadmap = `mindmap
  root((Learning Path))
    Basic Concepts
      Introduction to Topic
      Key Terminology
      Fundamental Principles
    Advanced Topics
      Detailed Analysis
      Case Studies
      Practical Applications
    Master Subject
      Final Assessment
      Ongoing Practice`;

// Function to update the roadmap in the UI
function testRoadmapRendering() {
  // Find the mermaid container
  const mermaidContainer = document.querySelector('.mermaid');
  
  if (mermaidContainer) {
    console.log('Found mermaid container, updating content...');
    mermaidContainer.textContent = testRoadmap;
    
    // Re-render the diagram
    window.mermaid.run({
      querySelector: '.mermaid'
    }).then(() => {
      console.log('Test roadmap rendered successfully');
    }).catch(error => {
      console.error('Error rendering test roadmap:', error);
    });
  } else {
    console.error('No mermaid container found');
  }
}

// Export the function and roadmap for use in the browser console
window.testRoadmapRendering = testRoadmapRendering;
window.testRoadmap = testRoadmap;

console.log('Test roadmap script loaded. Run window.testRoadmapRendering() to test.');
