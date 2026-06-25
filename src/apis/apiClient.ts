import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ApiResponse<T> {
  status: number;      
  message: string;     
  data: T;             
}


export const getBaseUrl = () => {
  if (__DEV__) {
    return process.env.EXPO_PUBLIC_API_BASE_URL ??'https://seven-hoops-rule.loca.lt';
  }
  return 'https://your-production-server.com'; 
};

// 3. Axios 인스턴스 생성
export const API_BASE_URL = getBaseUrl();

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
});


const PUBLIC_API_PATHS = [
  '/api/v1/members/signup',
  '/api/v1/members/login',
];

const isPublicApiPath = (url?: string) => {
  if (!url) {
    return false;
  }
  return PUBLIC_API_PATHS.some((path) => url.includes(path));
};

apiClient.interceptors.request.use(
  async (config) => {
    config.headers['ngrok-skip-browser-warning'] = 'true';

    if (isPublicApiPath(config.url)) {
      delete config.headers.Authorization;
      return config;
    }

    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);