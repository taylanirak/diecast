import { ApiClient } from '../client';
import {
  Trade,
  TradeWithDetails,
  CreateTradeDto,
  TradeResponseDto,
  PaginatedResponse,
} from '@tarodan/types';

export class TradeEndpoints {
  constructor(private client: ApiClient) {}

  async getMyTrades(query?: { page?: number; limit?: number; status?: string }): Promise<PaginatedResponse<TradeWithDetails>> {
    const response = await this.client.get<PaginatedResponse<TradeWithDetails>>('/trades', { params: query });
    return response.data;
  }

  async getById(id: string): Promise<TradeWithDetails> {
    const response = await this.client.get<TradeWithDetails>(`/trades/${id}`);
    return response.data;
  }

  async create(data: CreateTradeDto): Promise<Trade> {
    const response = await this.client.post<Trade>('/trades', data);
    return response.data;
  }

  async respond(id: string, data: TradeResponseDto): Promise<Trade> {
    const response = await this.client.post<Trade>(`/trades/${id}/respond`, data);
    return response.data;
  }

  async cancel(id: string): Promise<Trade> {
    const response = await this.client.post<Trade>(`/trades/${id}/cancel`);
    return response.data;
  }

  async agree(id: string): Promise<Trade> {
    const response = await this.client.post<Trade>(`/trades/${id}/agree`);
    return response.data;
  }

  async complete(id: string): Promise<Trade> {
    const response = await this.client.post<Trade>(`/trades/${id}/complete`);
    return response.data;
  }
}
