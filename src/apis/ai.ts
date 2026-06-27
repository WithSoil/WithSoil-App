// src/apis/ai.ts
import { apiClient } from './apiClient';

export interface AiChatResponseDto {
  chatId: number;
  title: string;
  status: string;
  answer: string;
  messageDateTime: string;
}

export interface AiChatSummaryResponseDto {
  chatId: number;
  title: string;
  chatDateTime: string;
  lastMessage: string | null;
  lastMessageDateTime: string | null;
}

export type AiChatMessageRole = 'USER' | 'ASSISTANT';

export interface AiChatMessageResponseDto {
  id: number;
  role: AiChatMessageRole;
  content: string;
  messageDateTime: string;
}

export interface AiChatDetailResponseDto {
  chatId: number;
  title: string;
  chatDateTime: string;
  messages: AiChatMessageResponseDto[];
}

export interface AiDiagnosisGuideItemResponse {
  title: string;
  content: string;
}

export interface AiDiagnosisGuideResponse {
  cropName: string;
  diseaseName: string;
  sourceDiseaseName: string;
  normal: boolean;
  symptoms: string;
  developmentCondition: string;
  preventionMethod: string;
  pathogenName: string;
  pathogenGroup: string;
  guideItems: AiDiagnosisGuideItemResponse[];
}

export interface AiDiagnosisResponseDto {
  status: string;
  crop: string;
  resultType: 'low_confidence' | 'healthy' | 'disease';
  diagnosis: string | null;
  message: string;
  confidence: number;
  guide: AiDiagnosisGuideResponse | null;
}

export interface AiRecommendRequestDto {
  region: string;
  purpose: string;
}

export interface CropRecommendDetailDto {
  cropName: string;
  recommendScore: number;
  aiReasonTitle: string;
  aiReasonDetail: string;
  difficultyLevel: string;
  optimalTemp: string;
  soilPh: string;
  cultivationPeriod: string;
  mainTasks: string[];
  mainRisks: string[];
}

export interface AiRecommendResponseDto {
  region: string;
  purpose: string;
  recommendedCrops: CropRecommendDetailDto[];
}



export const aiApi = {

  sendChatQuery: async (query: string, chatId?: number): Promise<AiChatResponseDto> => {

    const response = await apiClient.post<AiChatResponseDto>('/api/v1/ai/chat', {
      ...(chatId ? { chatId } : {}),
      query,
    });
    
    return response.data;
  },

  sendChatQueryWithImage: async (formData: FormData): Promise<AiChatResponseDto> => {
    const response = await apiClient.post<AiChatResponseDto>('/api/v1/ai/chat/image', formData);
    return response.data;
  },

  getChatHistories: async (): Promise<AiChatSummaryResponseDto[]> => {
    const response = await apiClient.get<AiChatSummaryResponseDto[]>('/api/v1/ai/chats');
    return response.data;
  },

  getChatHistory: async (chatId: number): Promise<AiChatDetailResponseDto> => {
    const response = await apiClient.get<AiChatDetailResponseDto>(`/api/v1/ai/chats/${chatId}`);
    return response.data;
  },

  deleteChatHistory: async (chatId: number): Promise<void> => {
    await apiClient.delete(`/api/v1/ai/chats/${chatId}`);
  },

  diagnoseCrop: async (formData: FormData): Promise<AiDiagnosisResponseDto> => {
    const response = await apiClient.post<AiDiagnosisResponseDto>('/api/v1/ai/diagnose', formData);
    return response.data;
  },

  recommendCrop: async (data: AiRecommendRequestDto): Promise<AiRecommendResponseDto> => {
    const response = await apiClient.post<AiRecommendResponseDto>('/api/v1/ai/recommend', data);
    return response.data;
  },
};
