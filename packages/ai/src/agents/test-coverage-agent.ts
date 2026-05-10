import { BaseAnalysisAgent } from './base-agent';
import { AnalysisDimension, AgentContext } from '../types/agent';

export class TestCoverageAgent extends BaseAnalysisAgent {
  constructor() {
    super('Test Coverage Analyzer', 'test_coverage');
  }

  async analyze(context: AgentContext): Promise<AnalysisDimension> {
    const issues = [];
    const suggestions = [];
    const metrics: Record<string, unknown> = {
      testFilesFound: 0,
      estimatedCoverage: 0,
      criticalPathsUntested: [],
      missingTests: [],
    };

    const testFiles = context.projectMetadata.files.filter((f) =>
      /test|spec/i.test(f.path)
    );

    metrics.testFilesFound = testFiles.length;

    const estimatedCoverage = this.estimateCoverage(
      context.projectMetadata.files,
      testFiles
    );
    metrics.estimatedCoverage = estimatedCoverage;

    // Check for test patterns
    if (testFiles.length === 0) {
      issues.push(
        this.createIssue(
          'tc-001',
          'high',
          'No test files detected in the project',
          undefined,
          undefined,
          'Create unit tests, integration tests, and end-to-end tests'
        )
      );
    } else if (estimatedCoverage < 50) {
      issues.push(
        this.createIssue(
          'tc-002',
          'high',
          `Low estimated test coverage: ${estimatedCoverage}%`,
          undefined,
          undefined,
          'Increase test coverage to at least 80% for production code'
        )
      );
    } else if (estimatedCoverage < 80) {
      issues.push(
        this.createIssue(
          'tc-003',
          'medium',
          `Test coverage below recommended level: ${estimatedCoverage}%`,
          undefined,
          undefined,
          'Aim for 80%+ coverage of business logic'
        )
      );
    }

    // Detect critical paths without tests
    const untested = this.findUntestedCriticalPaths(context.projectMetadata.files);
    if (untested.length > 0) {
      issues.push(...untested);
      metrics.criticalPathsUntested = untested.map((i) => i.message);
    }

    suggestions.push('Use code coverage tools to measure actual coverage');
    suggestions.push('Write tests for edge cases and error scenarios');
    suggestions.push('Implement CI/CD pipeline with automated testing');
    suggestions.push('Use mocking and stubbing for external dependencies');
    suggestions.push('Aim for 80-100% coverage of critical business logic');

    const score = this.calculateScore(issues);

    return {
      name: 'Test Coverage',
      score,
      issues,
      suggestions,
      metrics,
    };
  }

  private estimateCoverage(allFiles: any[], testFiles: any[]): number {
    if (testFiles.length === 0) return 0;

    const totalLines = allFiles.reduce((sum, f) => sum + f.size, 0);
    const testLines = testFiles.reduce((sum, f) => sum + f.size, 0);

    // Simple heuristic: test-to-code ratio
    const ratio = testLines / totalLines;
    return Math.min(Math.floor(ratio * 100), 100);
  }

  private findUntestedCriticalPaths(files: any[]): any[] {
    const issues: any[] = [];
    const criticalFunctions = ['authenticate', 'authorize', 'validate', 'process', 'handle'];

    files
      .filter((f) => !f.path.includes('test') && !f.path.includes('spec'))
      .forEach((file) => {
        criticalFunctions.forEach((func) => {
          const pattern = new RegExp(`\\b${func}\\s*\\(`, 'gi');
          const matches = file.content.match(pattern) || [];
          if (matches.length > 0) {
            issues.push(
              this.createIssue(
                `tc-path-${file.path}`,
                'medium',
                `Critical function '${func}' may lack test coverage`,
                file.path,
                undefined,
                `Add tests for ${func} function including happy path and error cases`
              )
            );
          }
        });
      });

    return issues.slice(0, 3); // Top 3 critical paths
  }
}
