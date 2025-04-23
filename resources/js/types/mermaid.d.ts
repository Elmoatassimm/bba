interface Window {
    mermaidConfig?: {
        theme: string;
        startOnLoad: boolean;
        securityLevel: string;
        logLevel: string;
        fontFamily: string;
        flowchart: {
            useMaxWidth: boolean;
            htmlLabels: boolean;
            curve: string;
            padding: number;
            nodeSpacing: number;
            rankSpacing: number;
        };
        mindmap: {
            useMaxWidth: boolean;
            padding: number;
            maxNodeWidth: number;
            htmlLabels: boolean;
        };
        sequence: {
            useMaxWidth: boolean;
            showSequenceNumbers: boolean;
            wrap: boolean;
            width: number;
            actorMargin: number;
            boxMargin: number;
        };
        classDiagram: {
            useMaxWidth: boolean;
            htmlLabels: boolean;
        };
        er: {
            useMaxWidth: boolean;
            layoutDirection: string;
        };
    };
}
