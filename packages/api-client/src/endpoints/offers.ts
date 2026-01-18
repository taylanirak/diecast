import { ApiClient } from '../client';
import {
  Offer,
  OfferWithDetails,
  CreateOfferDto,
  OfferResponseDto,
  PaginatedResponse,
} from '@tarodan/types';

export class OfferEndpoints {
  constructor(private client: ApiClient) {}

  async getMyOffers(query?: { page?: number; limit?: number; status?: string }): Promise<PaginatedResponse<OfferWithDetails>> {
    const response = await this.client.get<PaginatedResponse<OfferWithDetails>>('/offers/sent', { params: query });
    return response.data;
  }

  async getReceivedOffers(query?: { page?: number; limit?: number; status?: string }): Promise<PaginatedResponse<OfferWithDetails>> {
    const response = await this.client.get<PaginatedResponse<OfferWithDetails>>('/offers/received', { params: query });
    return response.data;
  }

  async getById(id: string): Promise<OfferWithDetails> {
    const response = await this.client.get<OfferWithDetails>(`/offers/${id}`);
    return response.data;
  }

  async create(data: CreateOfferDto): Promise<Offer> {
    const response = await this.client.post<Offer>('/offers', data);
    return response.data;
  }

  async respond(id: string, data: OfferResponseDto): Promise<Offer> {
    const response = await this.client.post<Offer>(`/offers/${id}/respond`, data);
    return response.data;
  }

  async cancel(id: string): Promise<Offer> {
    const response = await this.client.post<Offer>(`/offers/${id}/cancel`);
    return response.data;
  }

  async getOffersForProduct(productId: string): Promise<OfferWithDetails[]> {
    const response = await this.client.get<OfferWithDetails[]>(`/products/${productId}/offers`);
    return response.data;
  }
}
