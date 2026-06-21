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