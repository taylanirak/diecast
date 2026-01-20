import { ApiClient } from '../client';
import {
  User,
  AuthResponse,
  LoginDto,
  CreateUserDto,
} from '@tarodan/types';

export class AuthEndpoints {
  constructor(private client: ApiClient) {}

  async login(data: LoginDto): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/login', data);
    return response.data;
  }

  async register(data: CreateUserDto): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/register', data);
    return response.data;
  }

  async logout(): Promise<void> {
    await this.client.post('/auth/logout');
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/refresh', { refreshToken });
    return response.data;
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await this.client.post<{ message: string }>('/auth/forgot-password', { email });
    return response.data;
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const response = await this.client.post<{ message: string }>('/auth/reset-password', {
      token,
      newPassword,
    });
    return response.data;
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const response = await this.client.post<{ message: string }>('/auth/verify-email', { token });
    return response.data;
  }

  async resendVerification(email: string): Promise<{ message: string }> {
    const response = await this.client.post<{ message: string }>('/auth/resend-verification', { email });
    return response.data;
  }

  async getMe(): Promise<User> {
    const response = await this.client.get<User>('/auth/me');
    return response.data;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const response = await this.client.post<{ message: string }>('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  }
}
