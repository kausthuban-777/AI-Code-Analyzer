import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { analysisAPI, AnalysisResults, AnalysisStatus } from '../services/api'
import ResultsViewer from '../components/ResultsViewer'
import '../styles/results.css'

export default function Results() {
  const { analysisId } = useParams<{ analysisId: string }>()
  const navigate = useNavigate()
  const [analysis, setAnalysis] = useState<AnalysisStatus | null>(null)
  const [results, setResults] = useState<AnalysisResults | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [reportFormat, setReportFormat] = useState<'json' | 'markdown' | 'pdf'>('json')
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)

  useEffect(() => {
    if (analysisId) {
      loadAnalysis()
    }
  }, [analysisId])

  const loadAnalysis = async () => {
    if (!analysisId) return

    try {
      setIsLoading(true)
      setError('')

      const id = parseInt(analysisId)
      const [statusData, resultsData] = await Promise.all([
        analysisAPI.getStatus(id),
        analysisAPI.getResults(id).catch(() => null),
      ])

      setAnalysis(statusData)
      if (resultsData) {
        setResults(resultsData)
      }
    } catch (err: any) {
      setError('Failed to load analysis results')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateReport = async () => {
    if (!analysisId) return

    try {
      setIsGeneratingReport(true)
      const id = parseInt(analysisId)
      const blob = await analysisAPI.generateReport(id, reportFormat)

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url

      const ext = reportFormat === 'pdf' ? 'pdf' : reportFormat === 'markdown' ? 'md' : 'json'
      link.download = `analysis-${id}.${ext}`

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err: any) {
      setError('Failed to generate report')
      console.error(err)
    } finally {
      setIsGeneratingReport(false)
    }
  }

  if (isLoading) {
    return (
      <div className="results-container">
        <div className="loading">Loading analysis results...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="results-container">
        <div className="error-message">{error}</div>
        <button onClick={() => navigate('/')} className="btn btn-primary">
          Back to Dashboard
        </button>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="results-container">
        <div className="error-message">Analysis not found</div>
        <button onClick={() => navigate('/')} className="btn btn-primary">
          Back to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="results-container">
      <header className="results-header">
        <div className="header-content">
          <button onClick={() => navigate('/')} className="btn btn-secondary">
            ← Back
          </button>
          <div className="header-info">
            <h1>{analysis.projectName}</h1>
            <p className="status-badge" data-status={analysis.status}>
              {analysis.status.toUpperCase()}
            </p>
          </div>
        </div>
      </header>

      <main className="results-main">
        {analysis.status === 'processing' ? (
          <div className="processing-state">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${analysis.progress}%` }}></div>
            </div>
            <p>Analysis in progress... {analysis.progress}%</p>
            <button onClick={loadAnalysis} className="btn btn-secondary">
              Refresh
            </button>
          </div>
        ) : analysis.status === 'failed' ? (
          <div className="error-state">
            <p>Analysis failed: {analysis.errorMessage}</p>
            <button onClick={() => navigate('/')} className="btn btn-primary">
              Back to Dashboard
            </button>
          </div>
        ) : results ? (
          <>
            <div className="report-controls">
              <div className="format-selector">
                <label htmlFor="format">Export Format:</label>
                <select
                  id="format"
                  value={reportFormat}
                  onChange={(e) => setReportFormat(e.target.value as any)}
                  disabled={isGeneratingReport}
                >
                  <option value="json">JSON</option>
                  <option value="markdown">Markdown</option>
                  <option value="pdf">PDF</option>
                </select>
              </div>
              <button
                onClick={handleGenerateReport}
                className="btn btn-primary"
                disabled={isGeneratingReport}
              >
                {isGeneratingReport ? 'Generating...' : 'Download Report'}
              </button>
            </div>

            <ResultsViewer results={results} />
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
