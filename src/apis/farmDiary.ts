import { API_BASE_URL, apiClient, ApiResponse } from './apiClient';

export interface FarmDiaryPhotoResponse {
  id: number;
  originalFilename: string;
  photoUrl: string;
}

export interface FarmDiaryResponse {
  id: number;
  diaryDateTime: string;
  works: string[];
  memo?: string | null;
  photos: FarmDiaryPhotoResponse[];
}

export interface FarmDiarySummaryResponse {
  id: number;
  diaryDateTime: string;
  thumbnailUrl?: string | null;
  preview: string;
}

export interface FarmDiaryCalendarResponse {
  date: string;
  diaryCount: number;
}

export interface CreateFarmDiaryRequest {
  diaryDateTime: string;
  works: string[];
  memo?: string;
}

export interface DiaryPhotoFile {
  uri: string;
  name: string;
  type: string;
}

const toAbsoluteUrl = (url?: string | null) => {
  if (!url) {
    return null;
  }
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `${API_BASE_URL}${url}`;
};

const createDiaryFormData = (request: CreateFarmDiaryRequest, photos: DiaryPhotoFile[]) => {
  const formData = new FormData();
  formData.append('request', JSON.stringify(request));

  photos.forEach((photo) => {
    formData.append('photos', {
      uri: photo.uri,
      name: photo.name,
      type: photo.type,
    } as any);
  });

  return formData;
};

export const farmDiaryApi = {
  getMonthlyDiaries: async (month: string): Promise<FarmDiarySummaryResponse[]> => {
    const response = await apiClient.get<ApiResponse<FarmDiarySummaryResponse[]>>('/api/v1/farm-diaries', {
      params: { month },
    });
    return response.data.data.map((diary) => ({
      ...diary,
      thumbnailUrl: toAbsoluteUrl(diary.thumbnailUrl),
    }));
  },

  getMonthlyCalendar: async (month: string): Promise<FarmDiaryCalendarResponse[]> => {
    const response = await apiClient.get<ApiResponse<FarmDiaryCalendarResponse[]>>('/api/v1/farm-diaries/calendar', {
      params: { month },
    });
    return response.data.data;
  },

  getDiariesByDate: async (date: string): Promise<FarmDiaryResponse[]> => {
    const response = await apiClient.get<ApiResponse<FarmDiaryResponse[]>>(`/api/v1/farm-diaries/date/${date}`);
    return response.data.data.map((diary) => ({
      ...diary,
      photos: diary.photos.map((photo) => ({
        ...photo,
        photoUrl: toAbsoluteUrl(photo.photoUrl) ?? photo.photoUrl,
      })),
    }));
  },

  createDiary: async (request: CreateFarmDiaryRequest, photos: DiaryPhotoFile[]): Promise<FarmDiaryResponse> => {
    const response = await apiClient.post<ApiResponse<FarmDiaryResponse>>(
      '/api/v1/farm-diaries',
      createDiaryFormData(request, photos),
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return {
      ...response.data.data,
      photos: response.data.data.photos.map((photo) => ({
        ...photo,
        photoUrl: toAbsoluteUrl(photo.photoUrl) ?? photo.photoUrl,
      })),
    };
  },
};
