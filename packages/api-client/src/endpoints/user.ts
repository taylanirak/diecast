import { ApiClient } from '../client';
import {
  User,
  UserProfile,
  UpdateUserDto,
  Address,
  RatingSummary,
  PaginatedResponse,
} from '@tarodan/types';

export class UserEndpoints {
  constructor(private client: ApiClient) {}

  async getProfile(): Promise<UserProfile> {
    const response = await this.client.get<UserProfile>('/users/profile');
    return response.data;
  }

  async updateProfile(data: UpdateUserDto): Promise<User> {
    const response = await this.client.patch<User>('/users/profile', data);
    return response.data;
  }

  async getPublicProfile(userId: string): Promise<UserProfile> {
    const response = await this.client.get<UserProfile>(`/users/${userId}`);
    return response.data;
  }

  async getAddresses(): Promise<Address[]> {
    const response = await this.client.get<Address[]>('/users/addresses');
    return response.data;
  }

  async addAddress(data: Omit<Address, 'id' | 'userId'>): Promise<Address> {
    const response = await this.client.post<Address>('/users/addresses', data);
    return response.data;
  }

  async updateAddress(id: string, data: Partial<Address>): Promise<Address> {
    const response = await this.client.patch<Address>(`/users/addresses/${id}`, data);
    return response.data;
  }

  async deleteAddress(id: string): Promise<void> {
    await this.client.delete(`/users/addresses/${id}`);
  }

  async setDefaultAddress(id: string): Promise<void> {
    await this.client.post(`/users/addresses/${id}/default`);
  }

  async uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await this.client.post<{ avatarUrl: string }>('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async getRatings(userId: string, query?: { page?: number; limit?: number }): Promise<PaginatedResponse<any>> {
    const response = await this.client.get<PaginatedResponse<any>>(`/users/${userId}/ratings`, { params: query });
    return response.data;
  }

  async getRatingSummary(userId: string): Promise<RatingSummary> {
    const response = await this.client.get<RatingSummary>(`/users/${userId}/ratings/summary`);
    return response.data;
  }

  async becomeSeller(): Promise<User> {
    const response = await this.client.post<User>('/users/become-seller');
    return response.data;
  }
}
