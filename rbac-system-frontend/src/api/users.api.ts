import axiosInstance from './axios';
import type { User, CreateUserPayload, UpdateUserPayload, UpdateProfilePayload } from '@/types';

export interface FetchUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
}

// Backend shape: { success, users, pagination }
interface UsersResponse {
  success: boolean;
  users: User[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Backend shape: { success, user }
interface UserResponse {
  success: boolean;
  user: User;
}

export const fetchAllUsers = async (params: FetchUsersParams = {}): Promise<{ users: User[]; pagination: UsersResponse['pagination'] }> => {
  const response = await axiosInstance.get('/users', { params });
  return { users: response.data.data, pagination: response.data.pagination };
};

export const fetchUserById = async (id: string): Promise<User> => {
  const { data } = await axiosInstance.get<UserResponse>(`/users/${id}`);
  return data.user;
};

export const createUser = async (payload: CreateUserPayload): Promise<User> => {
  const { data } = await axiosInstance.post<UserResponse>('/users', payload);
  return data.user;
};

export const updateUser = async (id: string, payload: UpdateUserPayload): Promise<User> => {
  const { data } = await axiosInstance.patch<UserResponse>(`/users/${id}`, payload);
  return data.user;
};

export const deleteUser = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/users/${id}`);
};

export const fetchMyProfile = async (): Promise<User> => {
  const { data } = await axiosInstance.get<UserResponse>('/users/profile');
  return data.user;
};

export const updateMyProfile = async (payload: UpdateProfilePayload): Promise<User> => {
  const { data } = await axiosInstance.patch<UserResponse>('/users/profile', payload);
  return data.user;
};
