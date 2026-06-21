import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ApiResponse<T> {
  status: string;      
  message: string;     
  data: T;             
}


const getBaseUrl = () => {
  if (__DEV__) {
    return 'https://seven-hoops-rule.loca.lt';
  }
  return 'https://your-production-server.com'; 
};

// 3. Axios 인스턴스 생성
export const apiClient = axios.create({
  baseURL: getBaseUrl(),
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
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