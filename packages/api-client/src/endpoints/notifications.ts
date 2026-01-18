import { ApiClient } from '../client';
import {
  Notification,
  NotificationPreferences,
  CreatePushTokenDto,
  PaginatedResponse,
} from '@tarodan/types';

export class NotificationEndpoints {
  constructor(private client: ApiClient) {}

  async getAll(query?: { page?: number; limit?: number; unreadOnly?: boolean }): Promise<PaginatedResponse<Notification>> {
    const response = await this.client.get<PaginatedResponse<Notification>>('/notifications', { params: query });
    return response.data;
  }

  async markAsRead(id: string): Promise<void> {
    await this.client.patch(`/notifications/${id}/read`);
  }

  async markAllAsRead(): Promise<void> {
    await this.client.post('/notifications/mark-all-read');
  }

  async delete(id: string): Promise<void> {
    await this.client.delete(`/notifications/${id}`);
  }

  async getUnreadCount(): Promise<{ count: number }> {
    const response = await this.client.get<{ count: number }>('/notifications/unread-count');
    return response.data;
  }

  async getPreferences(): Promise<NotificationPreferences> {
    const response = await this.client.get<NotificationPreferences>('/notifications/preferences');
    return response.data;
  }

  async updatePreferences(data: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    const response = await this.client.patch<NotificationPreferences>('/notifications/preferences', data);
    return response.data;
  }

  async registerPushToken(data: CreatePushTokenDto): Promise<void> {
    await this.client.post('/notifications/push-token', data);
  }

  async removePushToken(token: string): Promise<void> {
    await this.client.delete(`/notifications/push-token/${token}`);
  }
}
