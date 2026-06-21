// src/apis/ai.ts
import { apiClient } from './apiClient';

export interface AiChatResponseDto {
  status: string;
  answer: string;
}
export interface AiDiagnosisResponseDto {
  status: string;
  crop: string;
  resultType: string;
  diagnosis: string;
  message: string;
  confidence: number;
}

export const aiApi = {

  sendChatQuery: async (query: string): Promise<AiChatResponseDto> => {

    const response = await apiClient.post<AiChatResponseDto>('/api/v1/ai/chat', {
      query,
    });
    
    return response.data;
  },

  diagnoseCrop: async (formData: FormData): Promise<AiDiagnosisResponseDto> => {
    const response = await apiClient.post<AiDiagnosisResponseDto>('/api/v1/ai/diagnose', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};