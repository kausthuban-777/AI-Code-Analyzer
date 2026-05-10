import React, { useState } from 'react'
import { analysisAPI, AnalysisStatus } from '../services/api'
import '../styles/components.css'

interface ProjectUploadProps {
  onAnalysisCreated: (analysis: AnalysisStatus) => void
  onCancel: () => void
}

export default function ProjectUpload({ onAnalysisCreated, onCancel }: ProjectUploadProps) {
  const [projectName, setProjectName] = useState('')
  const [description, setDescription] = useState('')
  const [sourceType, setSourceType] = useState<'zip' | 'github' | 'local'>('local')
  const [repositoryUrl, setRepositoryUrl] = useState('')
  const [problemStatement, setProblemStatement] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!projectName.trim()) {
      setError('Project name is required')
      return
    }

    if (sourceType === 'github' && !repositoryUrl.trim()) {
      setError('Repository URL is required for GitHub source')
      return
    }

    if (sourceType === 'local' && files.length === 0) {
      setError('Please select files to upload')
      return
    }

    setIsLoading(true)

    try {
      // Parse files
      const parsedFiles = await Promise.all(
        files.map(async (file) => {
          const content = await file.text()
          const language = getLanguageFromExtension(file.name)
          return {
            path: file.name,
            content,
            language,
          }
        })
      )

      const response = await analysisAPI.startAnalysis({
        projectName,
        description: description || undefined,
        sourceType,
        repositoryUrl: repositoryUrl || undefined,
        files: parsedFiles,
        problemStatement: problemStatement || undefined,
      })

      // Create analysis status object
      const newAnalysis: AnalysisStatus = {
        id: response.analysisId,
        userId: 0, // Will be set by backend
        projectName,
        description,
        sourceType,
        repositoryUrl,
        status: 'processing',
        progress: 0,
        startedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      onAnalysisCreated(newAnalysis)
    } catch (err: any) {
      setError(err.message || 'Failed to start analysis')
    } finally {
      setIsLoading(false)
    }
  }

  const getLanguageFromExtension = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase() || ''
    const languageMap: Record<string, string> = {
      ts: 'typescript',
      tsx: 'typescript',
      js: 'javascript',
      jsx: 'javascript',
      py: 'python',
      java: 'java',
      go: 'go',
      rs: 'rust',
      rb: 'ruby',
      php: 'php',
      cs: 'csharp',
      cpp: 'cpp',
      c: 'c',
      h: 'c',
      json: 'json',
      yaml: 'yaml',
      yml: 'yaml',
      xml: 'xml',
      html: 'html',
      css: 'css',
      md: 'markdown',
    }
    return languageMap[ext] || 'unknown'
  }

  return (
    <div className="upload-card">
      <h3>Create New Analysis</h3>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="projectName">Project Name *</label>
          <input
            id="projectName"
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="My Project"
            required
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Project description..."
            disabled={isLoading}
            rows={3}
          />
        </div>

        <div className="form-group">
          <label htmlFor="sourceType">Source Type *</label>
          <select
            id="sourceType"
            value={sourceType}
            onChange={(e) => setSourceType(e.target.value as any)}
            disabled={isLoading}
          >
            <option value="local">Local Files</option>
            <option value="github">GitHub Repository</option>
            <option value="zip">ZIP File</option>
          </select>
        </div>

        {sourceType === 'github' && (
          <div className="form-group">
            <label htmlFor="repositoryUrl">Repository URL *</label>
            <input
              id="repositoryUrl"
              type="url"
              value={repositoryUrl}
              onChange={(e) => setRepositoryUrl(e.target.value)}
              placeholder="https://github.com/user/repo"
              disabled={isLoading}
            />
          </div>
        )}

        {sourceType === 'local' && (
          <div className="form-group">
            <label htmlFor="files">Select Files *</label>
            <input
              id="files"
              type="file"
              multiple
              onChange={handleFileSelect}
              disabled={isLoading}
              accept=".ts,.tsx,.js,.jsx,.py,.java,.go,.rs,.rb,.php,.cs,.cpp,.c,.h,.json,.yaml,.yml,.xml,.html,.css,.md"
            />
            {files.length > 0 && (
              <div className="file-list">
                <p>{files.length} file(s) selected</p>
              </div>
            )}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="problemStatement">Problem Statement</label>
          <textarea
            id="problemStatement"
            value={problemStatement}
            onChange={(e) => setProblemStatement(e.target.value)}
            placeholder="What problem does this project solve?"
            disabled={isLoading}
            rows={4}
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? 'Starting Analysis...' : 'Start Analysis'}
          </button>
          <button type="button" onClick={onCancel} className="btn btn-secondary" disabled={isLoading}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
