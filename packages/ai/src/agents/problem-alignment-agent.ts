import { BaseAnalysisAgent } from './base-agent';
import { AnalysisDimension, AgentContext } from '../types/agent';

export class ProblemAlignmentAgent extends BaseAnalysisAgent {
  constructor() {
    super('Problem Alignment Analyzer', 'problem_alignment');
  }

  async analyze(context: AgentContext): Promise<AnalysisDimension> {
    const issues = [];
    const suggestions = [];
    const metrics: Record<string, unknown> = {
      requirementsCovered: 0,
      overEngineering: false,
      missingFeatures: [],
      extraFeatures: [],
    };

    if (!context.projectMetadata.problemStatement) {
      issues.push(
        this.createIssue(
          'pa-001',
          'high',
          'No problem statement provided for analysis',
          undefined,
          undefined,
          'Provide the original problem statement for accurate alignment analysis'
        )
      );

      return {
        name: 'Problem Alignment',
        score: 50,
        issues,
        suggestions: ['Provide project requirements or problem statement for detailed analysis'],
        metrics,
      };
    }

    // Analyze problem statement alignment
    const alignmentScore = this.analyzeAlignment(context);
    metrics.requirementsCovered = alignmentScore;

    // Check for over-engineering
    const overEngineering = this.detectOverEngineering(context);
    if (overEngineering.length > 0) {
      issues.push(...overEngineering);
      metrics.overEngineering = true;
    }

    // Check for missing features
    const missing = this.findMissingFeatures(context);
    if (missing.length > 0) {
      issues.push(...missing);
      metrics.missingFeatures = missing.map((i) => i.message);
    }

    suggestions.push('Ensure all requirements from the problem statement are implemented');
    suggestions.push('Avoid implementing features not specified in requirements');
    suggestions.push('Validate implementation against acceptance criteria');
    suggestions.push('Keep implementation focused and maintainable');

    const score = this.calculateScore(issues, 100);

    return {
      name: 'Problem Alignment',
      score,
      issues,
      suggestions,
      metrics,
    };
  }

  private analyzeAlignment(context: AgentContext): number {
    // This would integrate with Ollama for semantic analysis in production
    // For now, return a baseline score
    const problemLength = context.projectMetadata.problemStatement?.length || 0;
    const codeLength = context.projectMetadata.files.reduce((sum, f) => sum + f.size, 0);

    if (problemLength === 0) return 0;
    if (codeLength === 0) return 0;

    // Basic ratio-based assessment
    const ratio = codeLength / problemLength;
    if (ratio > 100) return 60; // Possibly over-engineered
    if (ratio > 50) return 80;
    if (ratio > 10) return 90;
    return 70;
  }

  private detectOverEngineering(context: AgentContext): any[] {
    const issues = [];

    // Check for unnecessary complexity
    if (context.projectMetadata.files.length > 50 && context.projectMetadata.totalLines < 5000) {
      issues.push(
        this.createIssue(
          'pa-001',
          'medium',
          'Project may be over-engineered with many small files',
          undefined,
          undefined,
          'Consolidate related files and reduce unnecessary abstraction'
        )
      );
    }

    // Check for unused dependencies
    const depCount = Object.keys(context.projectMetadata.packageJson?.dependencies || {}).length;
    if (depCount > 30) {
      issues.push(
        this.createIssue(
          'pa-002',
          'low',
          `Many dependencies (${depCount}) - potential over-engineering`,
          'package.json',
          undefined,
          'Review and remove unused dependencies'
        )
      );
    }

    return issues;
  }

  private findMissingFeatures(context: AgentContext): any[] {
    const issues = [];
    // This would use semantic analysis with Ollama in production
    // For now, return empty
    return issues;
  }
}
