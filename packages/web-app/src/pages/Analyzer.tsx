import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../services/auth-context'
import { analysisAPI, AnalysisStatus } from '../services/api'
import ProjectUpload from '../components/ProjectUpload'
import AnalysisList from '../components/AnalysisList'
import '../styles/analyzer.css'

export default function Analyzer() {
  const [analyses, setAnalyses] = useState<AnalysisStatus[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showUpload, setShowUpload] = useState(false)
  const navigate = useNavigate()
  const { logout, user } = useAuth()

  useEffect(() => {
    loadAnalyses()
  }, [])

  const loadAnalyses = async () => {
    try {
      setIsLoading(true)
      const data = await analysisAPI.getAnalyses()
      setAnalyses(data)
      setError('')
    } catch (err: any) {
      setError('Failed to load analyses')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnalysisCreated = (newAnalysis: AnalysisStatus) => {
    setAnalyses([newAnalysis, ...analyses])
    setShowUpload(false)
  }

  const handleAnalysisClick = (analysisId: number) => {
    navigate(`/results/${analysisId}`)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="analyzer-container">
      <header className="analyzer-header">
        <div className="header-content">
          <h1>AI Code Analyzer</h1>
          <div className="header-actions">
            <span className="user-info">Welcome, {user?.email}</span>
            <button onClick={handleLogout} className="btn btn-secondary">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="analyzer-main">
        <div className="analyzer-content">
          <div className="section-header">
            <h2>Code Analysis Dashboard</h2>
            <button
              onClick={() => setShowUpload(!showUpload)}
              className="btn btn-primary"
            >
              {showUpload ? 'Cancel' : 'New Analysis'}
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}

          {showUpload && (
            <ProjectUpload
              onAnalysisCreated={handleAnalysisCreated}
              onCancel={() => setShowUpload(false)}
            />
          )}

          {isLoading ? (
            <div className="loading">Loading analyses...</div>
          ) : analyses.length === 0 ? (
            <div className="empty-state">
              <p>No analyses yet. Create your first analysis to get started!</p>
            </div>
          ) : (
            <AnalysisList
              analyses={analyses}
              onAnalysisClick={handleAnalysisClick}
              onRefresh={loadAnalyses}
            />
          )}
        </div>
      </main>
    </div>
  )
}
