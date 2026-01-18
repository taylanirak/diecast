import { ApiClient } from '../client';
import {
  Conversation,
  ConversationWithDetails,
  Message,
  MessageWithSender,
  SendMessageDto,
  CreateConversationDto,
  PaginatedResponse,
} from '@tarodan/types';

export class MessageEndpoints {
  constructor(private client: ApiClient) {}

  async getConversations(query?: { page?: number; limit?: number }): Promise<PaginatedResponse<ConversationWithDetails>> {
    const response = await this.client.get<PaginatedResponse<ConversationWithDetails>>('/messages/conversations', {
      params: query,
    });
    return response.data;
  }

  async getConversation(id: string): Promise<ConversationWithDetails> {
    const response = await this.client.get<ConversationWithDetails>(`/messages/conversations/${id}`);
    return response.data;
  }

  async createConversation(data: CreateConversationDto): Promise<Conversation> {
    const response = await this.client.post<Conversation>('/messages/conversations', data);
    return response.data;
  }

  async getMessages(conversationId: string, query?: { page?: number; limit?: number }): Promise<PaginatedResponse<MessageWithSender>> {
    const response = await this.client.get<PaginatedResponse<MessageWithSender>>(
      `/messages/conversations/${conversationId}/messages`,
      { params: query }
    );
    return response.data;
  }

  async sendMessage(data: SendMessageDto): Promise<Message> {
    const response = await this.client.post<Message>('/messages', data);
    return response.data;
  }

  async markAsRead(conversationId: string): Promise<void> {
    await this.client.post(`/messages/conversations/${conversationId}/read`);
  }

  async getUnreadCount(): Promise<{ count: number }> {
    const response = await this.client.get<{ count: number }>('/messages/unread-count');
    return response.data;
  }

  async deleteConversation(id: string): Promise<void> {
    await this.client.delete(`/messages/conversations/${id}`);
  }
}
