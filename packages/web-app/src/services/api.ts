import axios, { AxiosInstance } from 'axios'

const API_BASE_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:3000/api'

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor to include auth token from localStorage
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

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
