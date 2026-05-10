import axios, { AxiosInstance } from 'axios'
import * as fs from 'fs'
import * as path from 'path'

const API_BASE_URL = 'http://localhost:3000/api'

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export interface ProjectFile {
  path: string
  content: string
  language: string
}

export interface AnalysisRequest {
  projectName: string
  description?: string
  sourceType: 'zip' | 'github' | 'local'
  repositoryUrl?: string
  files: ProjectFile[]
  packageJson?: Record<string, unknown>
  problemStatement?: string
}

export interface AnalysisResponse {
  analysisId: number
  status: string
}

export interface AnalysisStatus {
  id: number
  userId: number
  projectName: string
  description?: string
  sourceType: string
  repositoryUrl?: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  startedAt?: string
  completedAt?: string
  errorMessage?: string
  createdAt: string
  updatedAt: string
}

export interface AnalysisDimension {
  score: number
  issues: Array<{
    severity: 'critical' | 'high' | 'medium' | 'low'
    message: string
    file?: string
    line?: number
  }>
  suggestions: string[]
  metrics?: Record<string, any>
}

export interface AnalysisResults {
  analysisId: number
  projectName: string
  completedAt: string
  results: Array<{
    id: number
    analysisId: number
    dimension: string
    score: number
    details: AnalysisDimension
    createdAt: string
  }>
}

// Helper to read files from a directory
export const readProjectFiles = async (
  dirPath: string,
  extensions: string[] = [
    '.ts',
    '.tsx',
    '.js',
    '.jsx',
    '.py',
    '.java',
    '.go',
    '.rs',
    '.rb',
    '.php',
    '.cs',
    '.cpp',
    '.c',
    '.h',
    '.json',
    '.yaml',
    '.yml',
    '.xml',
    '.html',
    '.css',
    '.md',
  ]
): Promise<ProjectFile[]> => {
  const files: ProjectFile[] = []

  const walkDir = (dir: string) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true })

    for (const entry of entries) {
      // Skip node_modules, .git, dist, build, etc.
      if (
        entry.name.startsWith('.') ||
        entry.name === 'node_modules' ||
        entry.name === 'dist' ||
        entry.name === 'build' ||
        entry.name === '__pycache__'
      ) {
        continue
      }

      const fullPath = path.join(dir, entry.name)

      if (entry.isDirectory()) {
        walkDir(fullPath)
      } else if (extensions.some((ext) => entry.name.endsWith(ext))) {
        const content = fs.readFileSync(fullPath, 'utf-8')
        const language = getLanguageFromExtension(entry.name)

        files.push({
          path: path.relative(dirPath, fullPath),
          content,
          language,
        })
      }
    }
  }

  walkDir(dirPath)
  return files
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

export const analysisAPI = {
  startAnalysis: async (data: AnalysisRequest): Promise<AnalysisResponse> => {
    const response = await apiClient.post('/analysis/start', data)
    return response.data
  },

  getStatus: async (analysisId: number): Promise<AnalysisStatus> => {
    const response = await apiClient.get(`/analysis/${analysisId}/status`)
    return response.data
  },

  getResults: async (analysisId: number): Promise<AnalysisResults> => {
    const response = await apiClient.get(`/analysis/${analysisId}/results`)
    return response.data
  },

  getAnalyses: async (): Promise<AnalysisStatus[]> => {
    const response = await apiClient.get('/analysis')
    return response.data
  },

  generateReport: async (
    analysisId: number,
    format: 'json' | 'markdown' | 'pdf'
  ): Promise<Blob> => {
    const response = await apiClient.get(`/analysis/${analysisId}/report`, {
      params: { format },
      responseType: 'blob',
    })
    return response.data
  },
}

export default apiClient
