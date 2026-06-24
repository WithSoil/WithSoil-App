import { apiClient } from './apiClient';

export interface CreateDiaryParams {
  diaryDateTime: string; 
  works: string[];    
  memo: string;
  photoUris: string[];   
}

export const diaryApi = {
  createDiary: async (params: CreateDiaryParams) => {
    const formData = new FormData();

    const requestDto = {
      diaryDateTime: params.diaryDateTime,
      works: params.works,
      memo: params.memo,
    };
    formData.append('request', JSON.stringify(requestDto));

    if (params.photoUris && params.photoUris.length > 0) {
      params.photoUris.forEach((uri) => {
        const filename = uri.split('/').pop() || 'diary_photo.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        formData.append('photos', {
          uri: uri,
          name: filename,
          type: type,
        } as any);
      });
    }

    const response = await apiClient.post('/api/v1/farm-diaries', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getMonthlyDiaries: async (month: string) => {
    const response = await apiClient.get('/api/v1/farm-diaries', { params: { month } });
    return response.data.data; 
  },

  getMonthlyCalendar: async (month: string) => {
    const response = await apiClient.get('/api/v1/farm-diaries/calendar', { params: { month } });
    return response.data.data;
  },

  getDiariesByDate: async (date: string) => {
    const response = await apiClient.get(`/api/v1/farm-diaries/date/${date}`);
    return response.data.data;
  },

  getDiaryDetail: async (diaryId: number) => {
    const response = await apiClient.get(`/api/v1/farm-diaries/${diaryId}`);
    return response.data.data;
  },

  updateDiary: async (diaryId: number, params: CreateDiaryParams) => {
    const formData = new FormData();

    const requestDto = {
      diaryDateTime: params.diaryDateTime,
      works: params.works,
      memo: params.memo,
    };
    formData.append('request', JSON.stringify(requestDto));

    if (params.photoUris && params.photoUris.length > 0) {
      params.photoUris.forEach((uri) => {
        // 이미 http로 시작하는 서버 이미지인 경우의 처리 등은 필요에 따라 추가
        const filename = uri.split('/').pop() || 'diary_photo.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        formData.append('photos', {
          uri: uri,
          name: filename,
          type: type,
        } as any);
      });
    }

    const response = await apiClient.put(`/api/v1/farm-diaries/${diaryId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteDiary: async (diaryId: number) => {
    const response = await apiClient.delete(`/api/v1/farm-diaries/${diaryId}`);
    return response.data;
  },
};