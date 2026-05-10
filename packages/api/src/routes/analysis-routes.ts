import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../controllers/auth-controller';
import { AnalysisService } from '../services/analysis-service';
import { ReportService } from '../services/report-service';
import { getDatabase } from '../config/database';
import { analyses, analysisResults } from '../config/schema';
import { eq } from 'drizzle-orm';
import { logger } from '../config/logger';
import { getRedisClient } from '../config/redis';

const router = Router();
const analysisService = new AnalysisService();
const reportService = new ReportService();

interface AuthRequest extends Request {
  user?: { id: number; email: string };
}

// Start new analysis
router.post('/start', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { projectName, description, sourceType, repositoryUrl, files, packageJson, problemStatement } = req.body;

    if (!projectName || !files || !Array.isArray(files)) {
      res.status(400).json({ error: 'Invalid request body' });
      return;
    }

    const analysisId = await analysisService.startAnalysis({
      userId: req.user!.id,
      projectName,
      description,
      sourceType,
      repositoryUrl,
      files,
      packageJson,
      problemStatement,
    });

    res.json({ analysisId, status: 'processing' });
  } catch (error) {
    logger.error('Start analysis error', error);
    next(error);
  }
});

// Get analysis status
router.get('/:analysisId/status', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const analysisId = parseInt(req.params.analysisId);
    const analysis = await analysisService.getAnalysisStatus(analysisId);

    if (!analysis) {
      res.status(404).json({ error: 'Analysis not found' });
      return;
    }

    // Verify ownership
    if (analysis.userId !== req.user!.id) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    res.json(analysis);
  } catch (error) {
    logger.error('Get status error', error);
    next(error);
  }
});

// Get analysis results
router.get('/:analysisId/results', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const analysisId = parseInt(req.params.analysisId);
    const db = getDatabase();

    // Verify ownership and check status
    const [analysis] = await db
      .select()
      .from(analyses)
      .where(eq(analyses.id, analysisId));

    if (!analysis) {
      res.status(404).json({ error: 'Analysis not found' });
      return;
    }

    if (analysis.userId !== req.user!.id) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    if (analysis.status !== 'completed') {
      res.status(400).json({ error: 'Analysis not completed', status: analysis.status });
      return;
    }

    const results = await analysisService.getAnalysisResults(analysisId);

    res.json({
      analysisId,
      projectName: analysis.projectName,
      completedAt: analysis.completedAt,
      results,
    });
  } catch (error) {
    logger.error('Get results error', error);
    next(error);
  }
});

// Generate report
router.get('/:analysisId/report', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const analysisId = parseInt(req.params.analysisId);
    const format = (req.query.format as string) || 'json';

    if (!['json', 'markdown', 'pdf'].includes(format)) {
      res.status(400).json({ error: 'Invalid format. Use: json, markdown, pdf' });
      return;
    }

    const db = getDatabase();

    // Verify ownership
    const [analysis] = await db
      .select()
      .from(analyses)
      .where(eq(analyses.id, analysisId));

    if (!analysis) {
      res.status(404).json({ error: 'Analysis not found' });
      return;
    }

    if (analysis.userId !== req.user!.id) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const { buffer, fileName } = await reportService.generateReport(analysisId, format as any);

    res.setHeader('Content-Type', this.getContentType(format));
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', buffer.length);

    res.send(buffer);
  } catch (error) {
    logger.error('Report generation error', error);
    next(error);
  }
});

// Get user's analyses
router.get('/', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const db = getDatabase();

    const userAnalyses = await db
      .select()
      .from(analyses)
      .where(eq(analyses.userId, req.user!.id));

    res.json(userAnalyses);
  } catch (error) {
    logger.error('Get analyses error', error);
    next(error);
  }
});

// Helper function
function getContentType(format: string): string {
  switch (format) {
    case 'pdf':
      return 'application/pdf';
    case 'markdown':
      return 'text/markdown';
    case 'json':
    default:
      return 'application/json';
  }
}

export default router;
