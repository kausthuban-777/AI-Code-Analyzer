import { AnalysisDimension } from '../services/api'
import '../styles/components.css'

interface DimensionCardProps {
  dimension: string
  score: number
  details: AnalysisDimension
  isSelected: boolean
  onSelect: () => void
}

export default function DimensionCard({
  dimension,
  score,
  details,
  isSelected,
  onSelect,
}: DimensionCardProps) {
  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#10b981'
    if (score >= 60) return '#f59e0b'
    if (score >= 40) return '#f97316'
    return '#ef4444'
  }

  const criticalIssues = details.issues?.filter((i) => i.severity === 'critical').length || 0
  const highIssues = details.issues?.filter((i) => i.severity === 'high').length || 0

  return (
    <div
      className={`dimension-card ${isSelected ? 'selected' : ''}`}
      onClick={onSelect}
      style={{ cursor: 'pointer' }}
    >
      <div className="card-header">
        <h4>{dimension}</h4>
        <div className="score-badge" style={{ backgroundColor: getScoreColor(score) }}>
          {score}
        </div>
      </div>

      <div className="card-body">
        {criticalIssues > 0 && (
          <div className="issue-count critical">
            <span className="count">{criticalIssues}</span>
            <span className="label">Critical</span>
          </div>
        )}

        {highIssues > 0 && (
          <div className="issue-count high">
            <span className="count">{highIssues}</span>
            <span className="label">High</span>
          </div>
        )}

        {details.suggestions && details.suggestions.length > 0 && (
          <div className="suggestions-count">
            <span className="count">{details.suggestions.length}</span>
            <span className="label">Suggestions</span>
          </div>
        )}
      </div>

      <div className="card-footer">
        <button className="btn btn-sm btn-secondary">
          {isSelected ? 'Hide Details' : 'View Details'}
        </button>
      </div>
    </div>
  )
}
