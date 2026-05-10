import { BaseAnalysisAgent } from './base-agent';
import { AnalysisDimension, AgentContext } from '../types/agent';

export class SecurityAnalysisAgent extends BaseAnalysisAgent {
  private vulnerabilityPatterns = [
    { pattern: /eval\s*\(/gi, name: 'eval() usage', severity: 'critical' as const },
    { pattern: /exec\s*\(/gi, name: 'exec() usage', severity: 'critical' as const },
    {
      pattern: /child_process\.spawn/gi,
      name: 'Unvalidated command execution',
      severity: 'high' as const,
    },
    {
      pattern: /password\s*[=:]\s*['"][^'"]*['"]/gi,
      name: 'Hardcoded credentials',
      severity: 'critical' as const,
    },
    {
      pattern: /process\.env\.[A-Z_]+/gi,
      name: 'Environment variable exposure risk',
      severity: 'medium' as const,
    },
    {
      pattern: /\/\/.*password|\/\/.*api.?key|\/\/.*secret/gi,
      name: 'Credentials in comments',
      severity: 'high' as const,
    },
  ];

  constructor() {
    super('Security Analyzer', 'security');
  }

  async analyze(context: AgentContext): Promise<AnalysisDimension> {
    const issues = [];
    const suggestions = [];
    const metrics: Record<string, unknown> = {
      vulnerabilitiesFound: 0,
      riskLevel: 'low',
      affectedFiles: [],
      patterns: [],
    };

    // Scan for vulnerability patterns
    context.projectMetadata.files.forEach((file) => {
      if (this.isSecuritySensitiveFile(file.language)) {
        const fileVulnerabilities = this.scanForVulnerabilities(file);
        issues.push(...fileVulnerabilities);
        metrics.vulnerabilitiesFound = (metrics.vulnerabilitiesFound as number) + fileVulnerabilities.length;

        if (fileVulnerabilities.length > 0) {
          (metrics.affectedFiles as string[]).push(file.path);
        }
      }
    });

    // Check for dependency vulnerabilities
    if (context.projectMetadata.packageJson) {
      const depIssues = this.checkDependencies(context.projectMetadata.packageJson);
      issues.push(...depIssues);
    }

    // Determine risk level
    const criticalCount = issues.filter((i) => i.severity === 'critical').length;
    const highCount = issues.filter((i) => i.severity === 'high').length;

    if (criticalCount > 0) {
      metrics.riskLevel = 'critical';
    } else if (highCount > 2) {
      metrics.riskLevel = 'high';
    } else if (highCount > 0 || issues.length > 5) {
      metrics.riskLevel = 'medium';
    }

    // Suggestions
    suggestions.push('Use environment variables for sensitive configuration');
    suggestions.push('Implement input validation and sanitization');
    suggestions.push('Use security headers and CORS policies');
    suggestions.push('Regularly audit dependencies for vulnerabilities');
    suggestions.push('Never commit secrets or API keys to version control');

    const score = this.calculateScore(issues);

    return {
      name: 'Security',
      score,
      issues,
      suggestions,
      metrics,
    };
  }

  private isSecuritySensitiveFile(language: string): boolean {
    const securitySensitiveLanguages = ['typescript', 'javascript', 'python', 'java', 'go'];
    return securitySensitiveLanguages.includes(language.toLowerCase());
  }

  private scanForVulnerabilities(file: any): any[] {
    const issues: any[] = [];

    this.vulnerabilityPatterns.forEach((vuln) => {
      const matches = file.content.match(vuln.pattern);
      if (matches && matches.length > 0) {
        matches.forEach((_match: string) => {
          issues.push(
            this.createIssue(
              `sec-${issues.length + 1}`,
              vuln.severity,
              `Found ${vuln.name}: ${_match.substring(0, 50)}`,
              file.path,
              undefined,
              `Review and remediate ${vuln.name} usage`
            )
          );
        });
      }
    });

    return issues;
  }

  private checkDependencies(packageJson: Record<string, unknown>): any[] {
    const issues: any[] = [];
    const knownVulnerableDeps: Record<string, string> = {
      'lodash': '4.17.20',
      'moment': '2.29.1',
      'axios': '0.21.1',
    };

    const deps = { ...(packageJson.dependencies as Record<string, unknown> || {}), ...(packageJson.devDependencies as Record<string, unknown> || {}) };

    Object.entries(deps).forEach(([depName]) => {
      if (knownVulnerableDeps[depName]) {
        issues.push(
          this.createIssue(
            `sec-dep-${depName}`,
            'high',
            `Dependency ${depName} has known vulnerabilities`,
            'package.json',
            undefined,
            `Update ${depName} to version ${knownVulnerableDeps[depName]} or later`
          )
        );
      }
    });

    return issues;
  }
}
