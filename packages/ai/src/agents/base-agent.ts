import { AnalysisDimension, AgentContext, AnalysisIssue } from '../types/agent';

export abstract class BaseAnalysisAgent {
  protected name: string;
  protected dimension: string;

  constructor(name: string, dimension: string) {
    this.name = name;
    this.dimension = dimension;
  }

  abstract analyze(context: AgentContext): Promise<AnalysisDimension>;

  protected createIssue(
    id: string,
    severity: 'critical' | 'high' | 'medium' | 'low',
    message: string,
    file?: string,
    line?: number,
    suggestion?: string
  ): AnalysisIssue {
    return {
      id,
      severity,
      message,
      file,
      line,
      suggestion,
    };
  }

  protected calculateScore(issues: AnalysisIssue[], maxScore: number = 100): number {
    const criticalWeight = 15;
    const highWeight = 10;
    const mediumWeight = 5;
    const lowWeight = 2;

    let deduction = 0;
    for (const issue of issues) {
      switch (issue.severity) {
        case 'critical':
          deduction += criticalWeight;
          break;
        case 'high':
          deduction += highWeight;
          break;
        case 'medium':
          deduction += mediumWeight;
          break;
        case 'low':
          deduction += lowWeight;
          break;
      }
    }

    return Math.max(0, maxScore - deduction);
  }

  getName(): string {
    return this.name;
  }

  getDimension(): string {
    return this.dimension;
  }
}
