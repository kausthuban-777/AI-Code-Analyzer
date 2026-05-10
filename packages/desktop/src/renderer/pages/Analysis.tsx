import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { analysisAPI, AnalysisResults, AnalysisStatus } from '../services/api'
import '../styles/analysis.css'

export default function Analysis() {
  const { analysisId } = useParams<{ analysisId: string }>()
  const navigate = useNavigate()
  const [analysis, setAnalysis] = useState<AnalysisStatus | null>(null)
  const [results, setResults] = useState<AnalysisResults | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedDimension, setSelectedDimension] = useState<string | null>(null)

  useEffect(() => {
    if (analysisId) {
      loadAnalysis()
      const interval = setInterval(loadAnalysis, 5000)
      return () => clearInterval(interval)
    }
  }, [analysisId])

  const loadAnalysis = async () => {
    if (!analysisId) return

    try {
      const id = parseInt(analysisId)
      const [statusData, resultsData] = await Promise.all([
        analysisAPI.getStatus(id),
        analysisAPI.getResults(id).catch(() => null),
      ])

      setAnalysis(statusData)
      if (resultsData) {
        setResults(resultsData)
      }
      setError('')
    } catch (err: any) {
      setError('Failed to load analysis')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadReport = async (format: 'json' | 'markdown' | 'pdf') => {
    if (!analysisId) return

    try {
      const id = parseInt(analysisId)
      const blob = await analysisAPI.generateReport(id, format)

      // Use Electron IPC to save file
      const ext = format === 'pdf' ? 'pdf' : format === 'markdown' ? 'md' : 'json'
      const filename = `analysis-${id}.${ext}`

      await window.electron?.saveFile?.({
        filename,
        data: await blob.arrayBuffer(),
      })
    } catch (err: any) {
      setError('Failed to download report')
      console.error(err)
    }
  }

  if (isLoading) {
    return (
      <div className="analysis-container">
        <div className="loading">Loading analysis...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="analysis-container">
        <div className="error-message">{error}</div>
        <button onClick={() => navigate('/')} className="btn btn-primary">
          Back to Dashboard
        </button>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="analysis-container">
        <div className="error-message">Analysis not found</div>
        <button onClick={() => navigate('/')} className="btn btn-primary">
          Back to Dashboard
        </button>
      </div>
    )
  }

  const overallScore = results
    ? Math.round(results.results.reduce((sum, r) => sum + r.score, 0) / results.results.length)
    : 0

  return (
    <div className="analysis-container">
      <header className="analysis-header">
        <button onClick={() => navigate('/')} className="btn btn-secondary">
          ← Back
        </button>
        <div className="header-info">
          <h1>{analysis.projectName}</h1>
          <span className={`status-badge status-${analysis.status}`}>
            {analysis.status.toUpperCase()}
          </span>
        </div>
      </header>

      <main className="analysis-main">
        {analysis.status === 'processing' ? (
          <div className="processing-state">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${analysis.progress}%` }}></div>
            </div>
            <p>Analysis in progress... {analysis.progress}%</p>
          </div>
        ) : analysis.status === 'failed' ? (
          <div className="error-state">
            <p>Analysis failed: {analysis.errorMessage}</p>
          </div>
        ) : results ? (
          <>
            <div className="results-header">
              <div className="overall-score">
                <h3>Overall Score</h3>
                <div className="score-display">{overallScore}/100</div>
              </div>
              <div className="report-actions">
                <button
                  onClick={() => handleDownloadReport('json')}
                  className="btn btn-secondary"
                >
                  Download JSON
                </button>
                <button
                  onClick={() => handleDownloadReport('markdown')}
                  className="btn btn-secondary"
                >
                  Download Markdown
                </button>
                <button
                  onClick={() => handleDownloadReport('pdf')}
                  className="btn btn-secondary"
                >
                  Download PDF
                </button>
              </div>
            </div>

            <div className="dimensions-section">
              <h3>Analysis Dimensions</h3>
              <div className="dimensions-grid">
                {results.results.map((result) => (
                  <div
                    key={result.dimension}
                    className={`dimension-card ${selectedDimension === result.dimension ? 'selected' : ''}`}
                    onClick={() =>
                      setSelectedDimension(
                        selectedDimension === result.dimension ? null : result.dimension
                      )
                    }
                  >
                    <h4>{result.dimension}</h4>
                    <div className="score">{result.score}/100</div>
                    <div className="issues-count">
                      {result.details.issues?.length || 0} issues
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedDimension && (
              <div className="dimension-details">
                {results.results
                  .filter((r) => r.dimension === selectedDimension)
                  .map((result) => (
                    <div key={result.dimension}>
                      <h4>{result.dimension}</h4>

                      {result.details.issues && result.details.issues.length > 0 && (
                        <div className="issues-section">
                          <h5>Issues</h5>
                          <ul>
                            {result.details.issues.map((issue, idx) => (
                              <li key={idx} className={`issue-${issue.severity}`}>
                                <strong>[{issue.severity}]</strong> {issue.message}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {result.details.suggestions && result.details.suggestions.length > 0 && (
                        <div className="suggestions-section">
                          <h5>Suggestions</h5>
                          <ul>
                            {result.details.suggestions.map((suggestion, idx) => (
                              <li key={idx}>{suggestion}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <p>No results available yet</p>
          </div>
        )}
      </main>
    </div>
  )
}
