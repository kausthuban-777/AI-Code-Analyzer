import { BaseAnalysisAgent } from './base-agent';
import {
  CodeQualityAgent,
  SecurityAnalysisAgent,
  TestCoverageAgent,
  ArchitectureAgent,
  ProblemAlignmentAgent,
  PerformanceAgent,
} from './index';
import { AgentContext, AnalysisReport } from '../types/agent';

export class AgentOrchestrator {
  private agents: BaseAnalysisAgent[];

  constructor() {
    this.agents = [
      new CodeQualityAgent(),
      new SecurityAnalysisAgent(),
      new TestCoverageAgent(),
      new ArchitectureAgent(),
      new ProblemAlignmentAgent(),
      new PerformanceAgent(),
    ];
  }

  async orchestrateAnalysis(context: AgentContext): Promise<AnalysisReport> {
    const results = await this.executeAgentsInParallel(context);

    const report: AnalysisReport = {
      projectName: context.projectMetadata.projectName,
      timestamp: new Date().toISOString(),
      overallScore: this.calculateOverallScore(results),
      dimensions: {
        codeQuality: results[0],
        security: results[1],
        testCoverage: results[2],
        architecture: results[3],
        problemAlignment: results[4],
        performance: results[5],
      },
      summary: this.generateSummary(results),
    };

    return report;
  }

  private async executeAgentsInParallel(context: AgentContext): Promise<any[]> {
    const promises = this.agents.map((agent) => agent.analyze(context));
    return Promise.all(promises);
  }

  private calculateOverallScore(results: any[]): number {
    const totalScore = results.reduce((sum, result) => sum + result.score, 0);
    return Math.round(totalScore / results.length);
  }

  private generateSummary(results: any[]): { strengths: string[]; weaknesses: string[]; recommendations: string[] } {
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const recommendations: string[] = [];

    results.forEach((result) => {
      // Strengths: dimensions with high scores
      if (result.score >= 80) {
        strengths.push(`${result.name} is well-implemented`);
      }

      // Weaknesses: dimensions with low scores
      if (result.score < 50) {
        weaknesses.push(`${result.name} needs significant improvement`);
      }

      // Critical recommendations from each dimension
      const criticalIssues = result.issues.filter((i: any) => i.severity === 'critical');
      if (criticalIssues.length > 0) {
        recommendations.push(
          `Address ${criticalIssues.length} critical ${result.name.toLowerCase()} issues`
        );
      }

      // Add top suggestions
      recommendations.push(...result.suggestions.slice(0, 2));
    });

    return {
      strengths: [...new Set(strengths)],
      weaknesses: [...new Set(weaknesses)],
      recommendations: [...new Set(recommendations)].slice(0, 10),
    };
  }

  getAgents(): BaseAnalysisAgent[] {
    return this.agents;
  }
}
