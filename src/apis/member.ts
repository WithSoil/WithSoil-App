import { CropRecommendDetailDto } from './ai';
import { apiClient, ApiResponse } from './apiClient';

export interface MemberLocation {
  sido: string;
  sigungu: string;
  eupMyeonDong?: string;
  ri?: string;
  latitude?: number;
  longitude?: number;
}

export interface MemberSignupRequest {
  email: string;
  password?: string; 
  name: string;
}

export interface MemberSignupResponse {
  id: number;
  email: string;
  name: string;
}

export interface MemberLoginRequest {
  email: string;
  password?: string;
}

export interface MemberLoginResponse {
  accessToken: string;
}

export interface MemberMypageResponse {
  id: number;
  email: string;
  name: string;
  location?: MemberLocation; 
  recommendations?: CropRecommendDetailDto[];
}

export const memberApi = {

  signup: async (data: MemberSignupRequest): Promise<ApiResponse<MemberSignupResponse>> => {
    const response = await apiClient.post<ApiResponse<MemberSignupResponse>>('/api/v1/members/signup', data);
    return response.data;
  },

  login: async (data: MemberLoginRequest): Promise<ApiResponse<MemberLoginResponse>> => {
    const response = await apiClient.post<ApiResponse<MemberLoginResponse>>('/api/v1/members/login', data);
    return response.data;
  },

  getMypage: async (): Promise<ApiResponse<MemberMypageResponse>> => {
    const response = await apiClient.get<ApiResponse<MemberMypageResponse>>('/api/v1/members/mypage');
    return response.data;
  },

  updateLocation: async (data: MemberLocation): Promise<ApiResponse<MemberLocation>> => {
    const response = await apiClient.patch<ApiResponse<MemberLocation>>('/api/v1/members/location', data);
    return response.data;
  },
};