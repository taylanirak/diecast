import { ApiClient } from '../client';
import {
  Product,
  ProductWithSeller,
  CreateProductDto,
  UpdateProductDto,
  ProductQueryDto,
  PaginatedProducts,
  Category,
} from '@tarodan/types';

export class ProductEndpoints {
  constructor(private client: ApiClient) {}

  async getAll(query?: ProductQueryDto): Promise<PaginatedProducts> {
    const response = await this.client.get<PaginatedProducts>('/products', { params: query });
    return response.data;
  }

  async getById(id: string): Promise<ProductWithSeller> {
    const response = await this.client.get<ProductWithSeller>(`/products/${id}`);
    return response.data;
  }

  async getBySlug(slug: string): Promise<ProductWithSeller> {
    const response = await this.client.get<ProductWithSeller>(`/products/slug/${slug}`);
    return response.data;
  }

  async create(data: CreateProductDto): Promise<Product> {
    const response = await this.client.post<Product>('/products', data);
    return response.data;
  }

  async update(id: string, data: UpdateProductDto): Promise<Product> {
    const response = await this.client.patch<Product>(`/products/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.client.delete(`/products/${id}`);
  }

  async getMyProducts(query?: ProductQueryDto): Promise<PaginatedProducts> {
    const response = await this.client.get<PaginatedProducts>('/products/my', { params: query });
    return response.data;
  }

  async getByCategory(categorySlug: string, query?: ProductQueryDto): Promise<PaginatedProducts> {
    const response = await this.client.get<PaginatedProducts>(`/products/category/${categorySlug}`, {
      params: query,
    });
    return response.data;
  }

  async getBySeller(sellerId: string, query?: ProductQueryDto): Promise<PaginatedProducts> {
    const response = await this.client.get<PaginatedProducts>(`/products/seller/${sellerId}`, {
      params: query,
    });
    return response.data;
  }

  async search(searchTerm: string, query?: ProductQueryDto): Promise<PaginatedProducts> {
    const response = await this.client.get<PaginatedProducts>('/products/search', {
      params: { q: searchTerm, ...query },
    });
    return response.data;
  }

  async getFeatured(): Promise<ProductWithSeller[]> {
    const response = await this.client.get<ProductWithSeller[]>('/products/featured');
    return response.data;
  }

  async getRelated(productId: string): Promise<ProductWithSeller[]> {
    const response = await this.client.get<ProductWithSeller[]>(`/products/${productId}/related`);
    return response.data;
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    const response = await this.client.get<Category[]>('/categories');
    return response.data;
  }

  async getCategoryBySlug(slug: string): Promise<Category> {
    const response = await this.client.get<Category>(`/categories/${slug}`);
    return response.data;
  }
}
