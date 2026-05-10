import { useEffect, useState } from 'react'
import { AnalysisStatus } from '../services/api'
import '../styles/components.css'

interface AnalysisListProps {
  analyses: AnalysisStatus[]
  onAnalysisClick: (analysisId: number) => void
  onRefresh: () => void
}

export default function AnalysisList({ analyses, onAnalysisClick, onRefresh }: AnalysisListProps) {
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Auto-refresh if there are processing analyses
    const hasProcessing = analyses.some((a) => a.status === 'processing')

    if (hasProcessing) {
      const interval = setInterval(onRefresh, 5000) // Refresh every 5 seconds
      setRefreshInterval(interval)
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval)
      }
    }
  }, [analyses, onRefresh])

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed':
        return '#10b981'
      case 'processing':
        return '#f59e0b'
      case 'failed':
        return '#ef4444'
      default:
        return '#6b7280'
    }
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="analysis-list">
      <div className="list-header">
        <h3>Recent Analyses</h3>
        <button onClick={onRefresh} className="btn btn-secondary btn-sm">
          Refresh
        </button>
      </div>

      <div className="analyses-grid">
        {analyses.map((analysis) => (
          <div
            key={analysis.id}
            className="analysis-card"
            onClick={() => onAnalysisClick(analysis.id)}
            style={{ cursor: 'pointer' }}
          >
            <div className="card-header">
              <h4>{analysis.projectName}</h4>
              <span
                className="status-badge"
                style={{ backgroundColor: getStatusColor(analysis.status) }}
              >
                {analysis.status}
              </span>
            </div>

            {analysis.description && <p className="card-description">{analysis.description}</p>}

            <div className="card-meta">
              <div className="meta-item">
                <span className="meta-label">Source:</span>
                <span className="meta-value">{analysis.sourceType}</span>
              </div>

              {analysis.status === 'processing' && (
                <div className="meta-item">
                  <span className="meta-label">Progress:</span>
                  <span className="meta-value">{analysis.progress}%</span>
                </div>
              )}

              <div className="meta-item">
                <span className="meta-label">Created:</span>
                <span className="meta-value">{formatDate(analysis.createdAt)}</span>
              </div>

              {analysis.completedAt && (
                <div className="meta-item">
                  <span className="meta-label">Completed:</span>
                  <span className="meta-value">{formatDate(analysis.completedAt)}</span>
                </div>
              )}
            </div>

            {analysis.status === 'processing' && (
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${analysis.progress}%` }}></div>
              </div>
            )}

            {analysis.status === 'failed' && analysis.errorMessage && (
              <div className="error-text">{analysis.errorMessage}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
