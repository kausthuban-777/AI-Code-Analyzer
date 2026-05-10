export interface CodeFile {
  path: string;
  content: string;
  language: string;
  size: number;
}

export interface ProjectMetadata {
  projectName: string;
  description?: string;
  files: CodeFile[];
  totalFiles: number;
  totalLines: number;
  languages: Record<string, number>;
  packageJson?: Record<string, unknown>;
  problemStatement?: string;
}

export interface AnalysisDimension {
  name: string;
  score: number;
  issues: AnalysisIssue[];
  suggestions: string[];
  metrics: Record<string, unknown>;
}

export interface AnalysisIssue {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  file?: string;
  line?: number;
  suggestion?: string;
}

export interface AnalysisReport {
  projectName: string;
  timestamp: string;
  overallScore: number;
  dimensions: {
    codeQuality: AnalysisDimension;
    security: AnalysisDimension;
    testCoverage: AnalysisDimension;
    architecture: AnalysisDimension;
    problemAlignment: AnalysisDimension;
    performance: AnalysisDimension;
  };
  summary: {
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  };
}

export interface AgentContext {
  projectMetadata: ProjectMetadata;
  analysisId: string;
  progress: number;
  report: Partial<AnalysisReport>;
}
