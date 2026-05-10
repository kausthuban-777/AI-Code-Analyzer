import axios, { AxiosInstance } from 'axios';
import { config } from './config';
import { logger } from './logger';

interface OllamaEmbedRequest {
  model: string;
  prompt: string;
}

interface OllamaGenerateRequest {
  model: string;
  prompt: string;
  stream: boolean;
  system?: string;
  temperature?: number;
  top_p?: number;
  top_k?: number;
}

interface OllamaGenerateResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  total_duration: number;
  load_duration: number;
  prompt_eval_count: number;
  prompt_eval_duration: number;
  eval_count: number;
  eval_duration: number;
}

class OllamaClient {
  private client: AxiosInstance;
  private retryAttempts = 3;
  private retryDelay = 1000;

  constructor() {
    this.client = axios.create({
      baseURL: config.OLLAMA_BASE_URL,
      timeout: 120000,
    });
  }

  private async retry<T>(
    fn: () => Promise<T>,
    attempt: number = 1
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (attempt < this.retryAttempts) {
        logger.warn(`Attempt ${attempt} failed, retrying in ${this.retryDelay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, this.retryDelay));
        return this.retry(fn, attempt + 1);
      }
      throw error;
    }
  }

  async generate(
    prompt: string,
    options?: {
      model?: string;
      system?: string;
      temperature?: number;
      top_p?: number;
      top_k?: number;
    }
  ): Promise<string> {
    const model = options?.model || config.OLLAMA_MODEL;

    const request: OllamaGenerateRequest = {
      model,
      prompt,
      stream: false,
      system: options?.system,
      temperature: options?.temperature ?? 0.7,
      top_p: options?.top_p ?? 0.9,
      top_k: options?.top_k ?? 40,
    };

    try {
      const response = await this.retry(async () => {
        const res = await this.client.post<OllamaGenerateResponse>('/api/generate', request);
        return res.data;
      });

      return response.response;
    } catch (error) {
      logger.error('Ollama generation failed', error);
      throw new Error(`Failed to generate response from Ollama: ${error}`);
    }
  }

  async generateStructured<T>(
    prompt: string,
    schema: string,
    options?: {
      model?: string;
      system?: string;
      temperature?: number;
    }
  ): Promise<T> {
    const systemPrompt = `You are a JSON generator. Generate valid JSON that conforms to this schema:\n${schema}\nRespond with only valid JSON.`;

    const response = await this.generate(prompt, {
      model: options?.model,
      system: systemPrompt,
      temperature: options?.temperature ?? 0.3,
      top_p: 0.9,
      top_k: 40,
    });

    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      return JSON.parse(jsonMatch[0]) as T;
    } catch (error) {
      logger.error('Failed to parse structured response', { response, error });
      throw new Error(`Failed to parse structured response from Ollama: ${error}`);
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.retry(async () => {
        await this.client.get('/api/tags');
      });
      return true;
    } catch (error) {
      logger.error('Ollama health check failed', error);
      return false;
    }
  }

  async listModels(): Promise<string[]> {
    try {
      const response = await this.client.get<{ models: Array<{ name: string }> }>('/api/tags');
      return response.data.models.map((m) => m.name);
    } catch (error) {
      logger.error('Failed to list Ollama models', error);
      throw error;
    }
  }

  async pullModel(modelName: string): Promise<void> {
    try {
      await this.retry(async () => {
        await this.client.post(`/api/pull`, { name: modelName });
      });
      logger.info(`Model ${modelName} pulled successfully`);
    } catch (error) {
      logger.error(`Failed to pull model ${modelName}`, error);
      throw error;
    }
  }
}

let ollamaClient: OllamaClient | null = null;

export const initializeOllama = async (): Promise<OllamaClient> => {
  try {
    ollamaClient = new OllamaClient();
    const isHealthy = await ollamaClient.healthCheck();

    if (!isHealthy) {
      throw new Error('Ollama service is not responsive');
    }

    logger.info('Ollama client initialized and healthy');
    return ollamaClient;
  } catch (error) {
    logger.error('Failed to initialize Ollama', error);
    throw error;
  }
};

export const getOllamaClient = (): OllamaClient => {
  if (!ollamaClient) {
    throw new Error('Ollama client not initialized. Call initializeOllama() first.');
  }
  return ollamaClient;
};
