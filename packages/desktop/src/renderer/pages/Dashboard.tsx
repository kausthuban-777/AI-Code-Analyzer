import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../services/auth-context'
import { analysisAPI, AnalysisStatus, readProjectFiles } from '../services/api'
import '../styles/dashboard.css'

export default function Dashboard() {
  const [analyses, setAnalyses] = useState<AnalysisStatus[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [projectName, setProjectName] = useState('')
  const [description, setDescription] = useState('')
  const [problemStatement, setProblemStatement] = useState('')
  const [selectedPath, setSelectedPath] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
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

  const handleSelectFolder = async () => {
    // Use Electron IPC to open folder dialog
    const path = await window.electron?.selectFolder?.()
    if (path) {
      setSelectedPath(path)
    }
  }

  const handleStartAnalysis = async () => {
    if (!projectName.trim() || !selectedPath.trim()) {
      setError('Project name and folder path are required')
      return
    }

    setIsAnalyzing(true)
    setError('')

    try {
      const files = await readProjectFiles(selectedPath)

      if (files.length === 0) {
        setError('No source files found in the selected directory')
        setIsAnalyzing(false)
        return
      }

      const response = await analysisAPI.startAnalysis({
        projectName,
        description: description || undefined,
        sourceType: 'local',
        files,
        problemStatement: problemStatement || undefined,
      })

      const newAnalysis: AnalysisStatus = {
        id: response.analysisId,
        userId: 0,
        projectName,
        description,
        sourceType: 'local',
        status: 'processing',
        progress: 0,
        startedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      setAnalyses([newAnalysis, ...analyses])
      setProjectName('')
      setDescription('')
      setProblemStatement('')
      setSelectedPath('')
    } catch (err: any) {
      setError(err.message || 'Failed to start analysis')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleAnalysisClick = (analysisId: number) => {
    navigate(`/analysis/${analysisId}`)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>AI Code Analyzer - Desktop</h1>
        <div className="header-actions">
          <span className="user-info">{user?.email}</span>
          <button onClick={handleLogout} className="btn btn-secondary">
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-content">
          <div className="analysis-form">
            <h2>Analyze Local Project</h2>

            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <label htmlFor="projectName">Project Name *</label>
              <input
                id="projectName"
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="My Project"
                disabled={isAnalyzing}
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Project description..."
                disabled={isAnalyzing}
                rows={3}
              />
            </div>

            <div className="form-group">
              <label htmlFor="folderPath">Project Folder *</label>
              <div className="folder-selector">
                <input
                  id="folderPath"
                  type="text"
                  value={selectedPath}
                  readOnly
                  placeholder="Select a folder..."
                  className="folder-input"
                />
                <button
                  type="button"
                  onClick={handleSelectFolder}
                  className="btn btn-secondary"
                  disabled={isAnalyzing}
                >
                  Browse
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="problemStatement">Problem Statement</label>
              <textarea
                id="problemStatement"
                value={problemStatement}
                onChange={(e) => setProblemStatement(e.target.value)}
                placeholder="What problem does this project solve?"
                disabled={isAnalyzing}
                rows={4}
              />
            </div>

            <button
              onClick={handleStartAnalysis}
              className="btn btn-primary"
              disabled={isAnalyzing || !projectName.trim() || !selectedPath.trim()}
            >
              {isAnalyzing ? 'Starting Analysis...' : 'Start Analysis'}
            </button>
          </div>

          <div className="analyses-section">
            <h2>Recent Analyses</h2>

            {isLoading ? (
              <div className="loading">Loading analyses...</div>
            ) : analyses.length === 0 ? (
              <div className="empty-state">
                <p>No analyses yet. Create your first analysis to get started!</p>
              </div>
            ) : (
              <div className="analyses-list">
                {analyses.map((analysis) => (
                  <div
                    key={analysis.id}
                    className="analysis-item"
                    onClick={() => handleAnalysisClick(analysis.id)}
                  >
                    <div className="analysis-header">
                      <h4>{analysis.projectName}</h4>
                      <span className={`status-badge status-${analysis.status}`}>
                        {analysis.status}
                      </span>
                    </div>
                    {analysis.description && <p className="analysis-description">{analysis.description}</p>}
                    <div className="analysis-meta">
                      <span>Created: {new Date(analysis.createdAt).toLocaleDateString()}</span>
                      {analysis.status === 'processing' && <span>Progress: {analysis.progress}%</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
