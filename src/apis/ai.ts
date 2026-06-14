// src/apis/ai.ts
import { apiClient } from './apiClient';

export interface AiChatResponseDto {
  status: string;
  answer: string;
}

export const aiApi = {

  sendChatQuery: async (query: string): Promise<AiChatResponseDto> => {

    const response = await apiClient.post<AiChatResponseDto>('/api/v1/ai/chat', {
      query,
    });
    
    return response.data;
  },

  uploadYoloImage: async (formData: FormData): Promise<string> => {
    const response = await apiClient.post<string>('/api/v1/ai/yolo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};