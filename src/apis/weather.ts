import { apiClient, ApiResponse } from './apiClient';

export interface WeatherForecast {
  announcedAt: string;
  forecastAt: string;
  latitude: number;
  longitude: number;
  gridX: number;
  gridY: number;
  temperature: number;
  sky: string;
  precipitationType: string;
  precipitationProbability: number;
  hourlyPrecipitation: number;
  humidity: number;
  windSpeed: number;
  message: string;
}

export const weatherApi = {
  getSixHourForecast: async (
    latitude: number,
    longitude: number,
  ): Promise<ApiResponse<WeatherForecast>> => {
    const response = await apiClient.get<ApiResponse<WeatherForecast>>(
      '/api/v1/weather/forecast/6-hours',
      { params: { latitude, longitude } },
    );
    return response.data;
  },
};
