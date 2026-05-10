import { BaseAnalysisAgent } from './base-agent';
import { AnalysisDimension, AgentContext } from '../types/agent';

export class PerformanceAgent extends BaseAnalysisAgent {
  constructor() {
    super('Performance & Algorithm Analyzer', 'performance');
  }

  async analyze(context: AgentContext): Promise<AnalysisDimension> {
    const issues = [];
    const suggestions = [];
    const metrics: Record<string, unknown> = {
      potentialBottlenecks: [],
      inefficientPatterns: [],
      optimizationOpportunities: [],
    };

    // Check for inefficient patterns
    const inefficiencies = this.findInefficiencies(context.projectMetadata.files);
    issues.push(...inefficiencies);
    metrics.inefficientPatterns = inefficiencies.map((i) => i.message);

    // Check for n+1 query patterns (especially in database interactions)
    const queryIssues = this.checkQueryPatterns(context.projectMetadata.files);
    issues.push(...queryIssues);
    metrics.potentialBottlenecks = queryIssues.map((i) => i.message);

    // Check for memory-intensive patterns
    const memoryIssues = this.checkMemoryUsage(context.projectMetadata.files);
    issues.push(...memoryIssues);

    // Suggest optimizations
    suggestions.push('Use caching for frequently accessed data');
    suggestions.push('Implement pagination for large datasets');
    suggestions.push('Use async/await for I/O operations');
    suggestions.push('Optimize database queries and use indexes');
    suggestions.push('Profile code to identify actual bottlenecks');

    const score = this.calculateScore(issues);

    return {
      name: 'Performance',
      score,
      issues,
      suggestions,
      metrics,
    };
  }

  private findInefficiencies(files: any[]): any[] {
    const issues = [];

    files.forEach((file) => {
      // Check for synchronous operations that should be async
      const syncPatterns = /fs\.readFileSync|fs\.writeFileSync|process\.execSync/g;
      if (syncPatterns.test(file.content)) {
        issues.push(
          this.createIssue(
            `perf-001-${file.path}`,
            'high',
            'Synchronous I/O operations detected',
            file.path,
            undefined,
            'Use async/await instead of synchronous operations'
          )
        );
      }

      // Check for nested loops on large collections
      const nestedLoops = (file.content.match(/for\s*\(/g) || []).length;
      if (nestedLoops >= 2) {
        issues.push(
          this.createIssue(
            `perf-002-${file.path}`,
            'medium',
            'Nested loops detected - potential O(n²) complexity',
            file.path,
            undefined,
            'Consider using data structures like maps/sets to reduce complexity'
          )
        );
      }
    });

    return issues;
  }

  private checkQueryPatterns(files: any[]): any[] {
    const issues = [];

    files.forEach((file) => {
      if (/(query|select|from|where)/i.test(file.content)) {
        // Check for queries in loops
        const queryInLoop = /for\s*\(.*\)[\s\S]{0,200}(query|select|find)/i.test(file.content);
        if (queryInLoop) {
          issues.push(
            this.createIssue(
              `perf-query-${file.path}`,
              'high',
              'N+1 query pattern detected - queries in loops',
              file.path,
              undefined,
              'Use joins or batch queries instead of loop queries'
            )
          );
        }
      }
    });

    return issues;
  }

  private checkMemoryUsage(files: any[]): any[] {
    const issues = [];

    files.forEach((file) => {
      // Check for memory leaks patterns
      if (/setInterval|setTimeout|addEventListener/i.test(file.content)) {
        if (!/clearInterval|clearTimeout|removeEventListener/i.test(file.content)) {
          issues.push(
            this.createIssue(
              `perf-memory-${file.path}`,
              'medium',
              'Event listeners or timers set without cleanup',
              file.path,
              undefined,
              'Ensure proper cleanup of intervals, timeouts, and event listeners'
            )
          );
        }
      }
    });

    return issues;
  }
}
