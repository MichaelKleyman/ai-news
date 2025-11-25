export enum GeminiModel {
  FLASH = "gemini-2.5-flash",
  PRO = "gemini-3.0-pro",
}

export enum MessageRole {
  USER = "user",
  MODEL = "model",
  SYSTEM = "system",
}

export type GroundingSource = {
  title: string;
  url: string;
  snippet?: string;
};

export type AnalysisMetrics = {
  agreementScore?: number;
  confidenceScore?: number;
  sourcesAnalyzed?: number;
  biasIndicators?: string[];
};

export type Message = {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  isLoading?: boolean;
  groundingSources?: GroundingSource[];
  metrics?: AnalysisMetrics;
};

export type ChatSession = {
  id: string;
  title: string;
  model: GeminiModel;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
};
