import { AgentOrchestrator } from '@ai-code-analyzer/ai';
import { getRedisClient, setInCache, getFromCache } from '../config/redis';
import { getDatabase } from '../config/database';
import { analyses, analysisResults } from '../config/schema';
import { eq } from 'drizzle-orm';
import { logger } from '../config/logger';

export interface ProjectUpload {
  userId: number;
  projectName: string;
  description?: string;
  sourceType: 'zip' | 'github' | 'local';
  repositoryUrl?: string;
  files: Array<{ path: string; content: string; language: string }>;
  packageJson?: Record<string, unknown>;
  problemStatement?: string;
}

export class AnalysisService {
  private orchestrator: AgentOrchestrator;

  constructor() {
    this.orchestrator = new AgentOrchestrator();
  }

  async startAnalysis(upload: ProjectUpload): Promise<number> {
    try {
      const db = getDatabase();

      // Create analysis record
      const [analysis] = await db
        .insert(analyses)
        .values({
          userId: upload.userId,
          projectName: upload.projectName,
          description: upload.description,
          sourceType: upload.sourceType,
          repositoryUrl: upload.repositoryUrl,
          status: 'processing',
          progress: 0,
          startedAt: new Date().toISOString(),
        })
        .returning({ id: analyses.id });

      // Start async analysis
      this.performAnalysis(analysis.id, upload).catch((error) => {
        logger.error(`Analysis failed for ID ${analysis.id}`, error);
      });

      return analysis.id;
    } catch (error) {
      logger.error('Failed to start analysis', error);
      throw error;
    }
  }

  private async performAnalysis(analysisId: number, upload: ProjectUpload): Promise<void> {
    try {
      const db = getDatabase();

      // Build agent context
      const context = {
        projectMetadata: {
          projectName: upload.projectName,
          description: upload.description,
          files: upload.files.map((f) => ({
            path: f.path,
            content: f.content,
            language: f.language,
            size: f.content.length,
          })),
          totalFiles: upload.files.length,
          totalLines: upload.files.reduce(
            (sum, f) => sum + (f.content.match(/\n/g) || []).length,
            0
          ),
          languages: this.groupByLanguage(upload.files),
          packageJson: upload.packageJson,
          problemStatement: upload.problemStatement,
        },
        analysisId: analysisId.toString(),
        progress: 10,
        report: {},
      };

      // Run orchestration
      const report = await this.orchestrator.orchestrateAnalysis(context);

      // Store results
      await Promise.all([
        this.storeAnalysisResults(analysisId, report),
        this.updateAnalysisProgress(analysisId, 100),
      ]);

      // Mark as completed
      await db
        .update(analyses)
        .set({
          status: 'completed',
          completedAt: new Date().toISOString(),
          progress: 100,
        })
        .where(eq(analyses.id, analysisId));

      logger.info(`Analysis completed for ID ${analysisId}`);
    } catch (error) {
      logger.error(`Analysis failed for ID ${analysisId}`, error);

      const db = getDatabase();
      await db
        .update(analyses)
        .set({
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          progress: 0,
        })
        .where(eq(analyses.id, analysisId));
    }
  }

  private async storeAnalysisResults(analysisId: number, report: any): Promise<void> {
    try {
      const db = getDatabase();

      const dimensions = [
        { key: 'codeQuality', data: report.dimensions.codeQuality },
        { key: 'security', data: report.dimensions.security },
        { key: 'testCoverage', data: report.dimensions.testCoverage },
        { key: 'architecture', data: report.dimensions.architecture },
        { key: 'problemAlignment', data: report.dimensions.problemAlignment },
        { key: 'performance', data: report.dimensions.performance },
      ];

      for (const { key, data } of dimensions) {
        await db.insert(analysisResults).values({
          analysisId,
          dimension: key,
          score: data.score,
          details: {
            issues: data.issues,
            suggestions: data.suggestions,
            metrics: data.metrics,
          },
        });
      }

      // Cache the report
      await setInCache(`analysis:${analysisId}:report`, report, 86400);
    } catch (error) {
      logger.error(`Failed to store analysis results for ${analysisId}`, error);
      throw error;
    }
  }

  async getAnalysisStatus(analysisId: number): Promise<any> {
    try {
      const db = getDatabase();

      const [analysis] = await db
        .select()
        .from(analyses)
        .where(eq(analyses.id, analysisId));

      return analysis;
    } catch (error) {
      logger.error(`Failed to get analysis status for ${analysisId}`, error);
      throw error;
    }
  }

  async getAnalysisResults(analysisId: number): Promise<any> {
    try {
      // Try cache first
      const cached = await getFromCache(`analysis:${analysisId}:report`);
      if (cached) {
        return cached;
      }

      const db = getDatabase();
      const results = await db
        .select()
        .from(analysisResults)
        .where(eq(analysisResults.analysisId, analysisId));

      return results;
    } catch (error) {
      logger.error(`Failed to get analysis results for ${analysisId}`, error);
      throw error;
    }
  }

  private groupByLanguage(files: any[]): Record<string, number> {
    return files.reduce(
      (acc, file) => {
        const lang = file.language || 'unknown';
        acc[lang] = (acc[lang] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
  }

  private async updateAnalysisProgress(analysisId: number, progress: number): Promise<void> {
    try {
      const db = getDatabase();

      await db
        .update(analyses)
        .set({ progress })
        .where(eq(analyses.id, analysisId));
    } catch (error) {
      logger.error(`Failed to update progress for ${analysisId}`, error);
    }
  }
}
