import axiosInstance from './axios';
import type { AuthResponse, ApiResponse, User } from '@/types';

export const loginUser = async (email: string, password: string): Promise<AuthResponse> => {
  const { data } = await axiosInstance.post<AuthResponse>('/auth/login', { email, password });
  return data;
};

export const logoutUser = async (): Promise<void> => {
  await axiosInstance.post('/auth/logout');
};

export const getMe = async (): Promise<User> => {
  const { data } = await axiosInstance.get<{ success: boolean; user: User }>('/auth/me');
  return data.user;
};

export const refreshToken = async (): Promise<string> => {
  const { data } = await axiosInstance.post<{ success: boolean; accessToken: string }>('/auth/refresh');
  return data.accessToken;
};
