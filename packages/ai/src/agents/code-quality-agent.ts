import { BaseAnalysisAgent } from './base-agent';
import { AnalysisDimension, AgentContext } from '../types/agent';

export class CodeQualityAgent extends BaseAnalysisAgent {
  constructor() {
    super('Code Quality Analyzer', 'code_quality');
  }

  async analyze(context: AgentContext): Promise<AnalysisDimension> {
    const issues = [];
    const suggestions = [];
    const metrics: Record<string, unknown> = {
      totalFiles: context.projectMetadata.totalFiles,
      totalLines: context.projectMetadata.totalLines,
      averageFileSize: 0,
      complexFiles: [],
      smellDetected: [],
    };

    // Analyze file structure and size
    let totalSize = 0;
    const largeFiles = context.projectMetadata.files.filter((file) => {
      totalSize += file.size;
      return file.size > 10000;
    });

    metrics.averageFileSize = totalSize / context.projectMetadata.totalFiles;

    if (largeFiles.length > 0) {
      issues.push(
        this.createIssue(
          'cq-001',
          'high',
          `Found ${largeFiles.length} files larger than 10KB which may indicate low cohesion`,
          largeFiles[0].path,
          undefined,
          'Consider breaking down large files into smaller, focused modules'
        )
      );
      metrics.complexFiles = largeFiles.map((f) => ({ path: f.path, size: f.size }));
    }

    // Detect code smells (basic patterns)
    const codeSmells = this.detectCodeSmells(context.projectMetadata.files);
    if (codeSmells.length > 0) {
      issues.push(...codeSmells);
      metrics.smellDetected = codeSmells.map((i) => i.message);
    }

    // Check for proper naming conventions
    const namingIssues = this.checkNamingConventions(context.projectMetadata.files);
    if (namingIssues.length > 0) {
      issues.push(...namingIssues);
    }

    // Suggestions
    if (context.projectMetadata.totalLines > 5000) {
      suggestions.push('Large codebase detected. Consider implementing clearer modularization');
    }

    suggestions.push('Maintain consistent code formatting across the project');
    suggestions.push('Use meaningful variable and function names for better readability');

    const score = this.calculateScore(issues);

    return {
      name: 'Code Quality',
      score,
      issues,
      suggestions,
      metrics,
    };
  }

  private detectCodeSmells(files: any[]): any[] {
    const issues = [];
    let duplicatePatterns = 0;

    // Check for duplicate code patterns
    for (let i = 0; i < files.length; i++) {
      for (let j = i + 1; j < files.length; j++) {
        const similarity = this.calculateStringSimilarity(files[i].content, files[j].content);
        if (similarity > 0.6 && files[i].language === files[j].language) {
          duplicatePatterns++;
        }
      }
    }

    if (duplicatePatterns > 0) {
      issues.push(
        this.createIssue(
          'cq-002',
          'medium',
          `Detected potential code duplication across ${duplicatePatterns} file pairs`,
          undefined,
          undefined,
          'Extract common logic into shared utilities or base classes'
        )
      );
    }

    return issues;
  }

  private checkNamingConventions(files: any[]): any[] {
    const issues = [];

    files.forEach((file) => {
      // Check for single-letter or non-descriptive variable names
      const singleLetterRegex = /\b[a-z]\b/g;
      const matches = file.content.match(singleLetterRegex) || [];

      if (matches.length > 10) {
        issues.push(
          this.createIssue(
            'cq-003',
            'low',
            `File uses single-letter variables frequently`,
            file.path,
            undefined,
            'Use descriptive variable names instead of single letters'
          )
        );
      }
    });

    return issues;
  }

  private calculateStringSimilarity(str1: string, str2: string): number {
    const length = Math.min(str1.length, str2.length);
    let matches = 0;

    for (let i = 0; i < length; i++) {
      if (str1[i] === str2[i]) matches++;
    }

    return matches / Math.max(str1.length, str2.length);
  }
}
