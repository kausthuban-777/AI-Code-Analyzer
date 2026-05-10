import { useState } from 'react'
import { AnalysisResults } from '../services/api'
import DimensionCard from './DimensionCard'
import '../styles/components.css'

interface ResultsViewerProps {
  results: AnalysisResults
}

export default function ResultsViewer({ results }: ResultsViewerProps) {
  const [selectedDimension, setSelectedDimension] = useState<string | null>(null)

  // Calculate overall score
  const overallScore = Math.round(
    results.results.reduce((sum, r) => sum + r.score, 0) / results.results.length
  )

  // Sort results by score (descending)
  const sortedResults = [...results.results].sort((a, b) => b.score - a.score)

  // Get score color
  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#10b981' // green
    if (score >= 60) return '#f59e0b' // amber
    if (score >= 40) return '#f97316' // orange
    return '#ef4444' // red
  }

  return (
    <div className="results-viewer">
      <div className="overall-score-section">
        <div className="overall-score-card">
          <h3>Overall Score</h3>
          <div className="score-display" style={{ color: getScoreColor(overallScore) }}>
            <span className="score-number">{overallScore}</span>
            <span className="score-max">/100</span>
          </div>
          <p className="score-description">
            {overallScore >= 80
              ? 'Excellent code quality'
              : overallScore >= 60
                ? 'Good code quality'
                : overallScore >= 40
                  ? 'Fair code quality'
                  : 'Needs improvement'}
          </p>
        </div>

        <div className="score-summary">
          <h4>Summary</h4>
          <div className="summary-stats">
            {sortedResults.map((result) => (
              <div key={result.dimension} className="summary-stat">
                <span className="stat-label">{result.dimension}</span>
                <span
                  className="stat-score"
                  style={{ color: getScoreColor(result.score) }}
                >
                  {result.score}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="dimensions-section">
        <h3>Analysis Dimensions</h3>
        <div className="dimensions-grid">
          {sortedResults.map((result) => (
            <DimensionCard
              key={result.dimension}
              dimension={result.dimension}
              score={result.score}
              details={result.details}
              isSelected={selectedDimension === result.dimension}
              onSelect={() =>
                setSelectedDimension(
                  selectedDimension === result.dimension ? null : result.dimension
                )
              }
            />
          ))}
        </div>
      </div>

      {selectedDimension && (
        <div className="dimension-details">
          {sortedResults
            .filter((r) => r.dimension === selectedDimension)
            .map((result) => (
              <div key={result.dimension} className="details-card">
                <h4>{result.dimension}</h4>

                {result.details.issues && result.details.issues.length > 0 && (
                  <div className="issues-section">
                    <h5>Issues ({result.details.issues.length})</h5>
                    <div className="issues-list">
                      {result.details.issues.map((issue, idx) => (
                        <div key={idx} className="issue-item" data-severity={issue.severity}>
                          <span className="severity-badge">{issue.severity}</span>
                          <div className="issue-content">
                            <p className="issue-message">{issue.message}</p>
                            {issue.file && (
                              <p className="issue-location">
                                {issue.file}
                                {issue.line && `:${issue.line}`}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {result.details.suggestions && result.details.suggestions.length > 0 && (
                  <div className="suggestions-section">
                    <h5>Suggestions</h5>
                    <ul className="suggestions-list">
                      {result.details.suggestions.map((suggestion, idx) => (
                        <li key={idx}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.details.metrics && Object.keys(result.details.metrics).length > 0 && (
                  <div className="metrics-section">
                    <h5>Metrics</h5>
                    <div className="metrics-grid">
                      {Object.entries(result.details.metrics).map(([key, value]) => (
                        <div key={key} className="metric-item">
                          <span className="metric-label">{key}</span>
                          <span className="metric-value">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
