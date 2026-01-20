import { ApiClient } from '../client';
import {
  WishlistItemWithProduct,
  Collection,
  CollectionWithItems,
  CreateCollectionDto,
  UpdateCollectionDto,
  AddToCollectionDto,
  PaginatedResponse,
} from '@tarodan/types';

export class WishlistEndpoints {
  constructor(private client: ApiClient) {}

  // Wishlist
  async getWishlist(query?: { page?: number; limit?: number }): Promise<PaginatedResponse<WishlistItemWithProduct>> {
    const response = await this.client.get<PaginatedResponse<WishlistItemWithProduct>>('/wishlist', { params: query });
    return response.data;
  }

  async addToWishlist(productId: string): Promise<void> {
    await this.client.post('/wishlist', { productId });
  }

  async removeFromWishlist(productId: string): Promise<void> {
    await this.client.delete(`/wishlist/${productId}`);
  }

  async isInWishlist(productId: string): Promise<{ inWishlist: boolean }> {
    const response = await this.client.get<{ inWishlist: boolean }>(`/wishlist/check/${productId}`);
    return response.data;
  }

  // Collections
  async getCollections(query?: { page?: number; limit?: number }): Promise<PaginatedResponse<Collection>> {
    const response = await this.client.get<PaginatedResponse<Collection>>('/collections', { params: query });
    return response.data;
  }

  async getCollection(id: string): Promise<CollectionWithItems> {
    const response = await this.client.get<CollectionWithItems>(`/collections/${id}`);
    return response.data;
  }

  async createCollection(data: CreateCollectionDto): Promise<Collection> {
    const response = await this.client.post<Collection>('/collections', data);
    return response.data;
  }

  async updateCollection(id: string, data: UpdateCollectionDto): Promise<Collection> {
    const response = await this.client.patch<Collection>(`/collections/${id}`, data);
    return response.data;
  }

  async deleteCollection(id: string): Promise<void> {
    await this.client.delete(`/collections/${id}`);
  }

  async addToCollection(collectionId: string, data: AddToCollectionDto): Promise<void> {
    await this.client.post(`/collections/${collectionId}/items`, data);
  }

  async removeFromCollection(collectionId: string, productId: string): Promise<void> {
    await this.client.delete(`/collections/${collectionId}/items/${productId}`);
  }

  async getPublicCollections(userId: string, query?: { page?: number; limit?: number }): Promise<PaginatedResponse<Collection>> {
    const response = await this.client.get<PaginatedResponse<Collection>>(`/users/${userId}/collections`, { params: query });
    return response.data;
  }
}
