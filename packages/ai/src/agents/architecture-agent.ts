import { BaseAnalysisAgent } from './base-agent';
import { AnalysisDimension, AgentContext } from '../types/agent';

export class ArchitectureAgent extends BaseAnalysisAgent {
  constructor() {
    super('Architecture Reviewer', 'architecture');
  }

  async analyze(context: AgentContext): Promise<AnalysisDimension> {
    const issues = [];
    const suggestions = [];
    const metrics: Record<string, unknown> = {
      folderDepth: 0,
      modularity: 0,
      layerViolations: 0,
      circularDependencies: [],
    };

    // Analyze folder structure
    const structure = this.analyzeStructure(context.projectMetadata.files);
    metrics.folderDepth = structure.maxDepth;

    // Check for proper layering
    const layerIssues = this.checkLayering(context.projectMetadata.files);
    issues.push(...layerIssues);
    metrics.layerViolations = layerIssues.length;

    // Check modularity
    metrics.modularity = this.assessModularity(context.projectMetadata.files);

    // Check for circular dependencies
    const circularDeps = this.findCircularDependencies(context.projectMetadata.files);
    if (circularDeps.length > 0) {
      issues.push(
        this.createIssue(
          'arch-001',
          'high',
          `Detected ${circularDeps.length} potential circular dependencies`,
          undefined,
          undefined,
          'Refactor code to eliminate circular dependencies'
        )
      );
      metrics.circularDependencies = circularDeps;
    }

    // Check for SOLID principle violations
    const solidIssues = this.checkSOLID(context.projectMetadata.files);
    issues.push(...solidIssues);

    if (structure.maxDepth > 5) {
      issues.push(
        this.createIssue(
          'arch-002',
          'medium',
          `Deep folder nesting detected (depth: ${structure.maxDepth})`,
          undefined,
          undefined,
          'Flatten folder structure for better maintainability'
        )
      );
    }

    suggestions.push('Implement clear architectural layers (presentation, business logic, data)');
    suggestions.push('Use dependency injection for loose coupling');
    suggestions.push('Follow SOLID principles consistently');
    suggestions.push('Define clear module boundaries');
    suggestions.push('Document architecture decisions');

    const score = this.calculateScore(issues);

    return {
      name: 'Architecture',
      score,
      issues,
      suggestions,
      metrics,
    };
  }

  private analyzeStructure(files: any[]): { maxDepth: number; folders: string[] } {
    let maxDepth = 0;
    const folders = new Set<string>();

    files.forEach((file) => {
      const depth = (file.path.match(/\//g) || []).length;
      maxDepth = Math.max(maxDepth, depth);
      const folder = file.path.substring(0, file.path.lastIndexOf('/'));
      folders.add(folder);
    });

    return { maxDepth, folders: Array.from(folders) };
  }

  private checkLayering(files: any[]): any[] {
    const issues = [];
    const layerPatterns = {
      controller: /controller|route|endpoint/i,
      service: /service|business/i,
      data: /repository|dao|model/i,
      util: /util|helper|common/i,
    };

    // Simplified check - in real implementation would be deeper
    const filesByLayer = new Map<string, string[]>();

    files.forEach((file) => {
      Object.entries(layerPatterns).forEach(([layer, pattern]) => {
        if (pattern.test(file.path)) {
          if (!filesByLayer.has(layer)) filesByLayer.set(layer, []);
          filesByLayer.get(layer)!.push(file.path);
        }
      });
    });

    return issues;
  }

  private assessModularity(files: any[]): number {
    const folders = new Set(files.map((f) => f.path.substring(0, f.path.lastIndexOf('/'))));
    const avgFilesPerFolder = files.length / Math.max(folders.size, 1);

    // Ideal: 3-8 files per module
    if (avgFilesPerFolder >= 3 && avgFilesPerFolder <= 8) return 85;
    if (avgFilesPerFolder > 8) return 60;
    return 70;
  }

  private findCircularDependencies(files: any[]): string[] {
    // Placeholder for actual circular dependency detection
    return [];
  }

  private checkSOLID(files: any[]): any[] {
    const issues = [];

    // Single Responsibility Principle - check for large files
    files.forEach((file) => {
      if (file.size > 5000) {
        issues.push(
          this.createIssue(
            `solid-srp-${file.path}`,
            'medium',
            `File violates Single Responsibility Principle (too large)`,
            file.path,
            undefined,
            'Split file into smaller, focused modules'
          )
        );
      }
    });

    return issues.slice(0, 3);
  }
}
