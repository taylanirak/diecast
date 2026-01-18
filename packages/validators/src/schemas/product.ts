import { z } from 'zod';

export const createProductSchema = z.object({
  name: z
    .string()
    .min(1, 'Ürün adı gereklidir')
    .min(3, 'Ürün adı en az 3 karakter olmalıdır')
    .max(100, 'Ürün adı en fazla 100 karakter olabilir'),
  description: z
    .string()
    .min(1, 'Açıklama gereklidir')
    .min(20, 'Açıklama en az 20 karakter olmalıdır')
    .max(5000, 'Açıklama en fazla 5000 karakter olabilir'),
  price: z
    .number()
    .min(1, 'Fiyat en az 1 TL olmalıdır')
    .max(1000000, 'Fiyat en fazla 1.000.000 TL olabilir'),
  categoryId: z.string().min(1, 'Kategori seçimi gereklidir'),
  condition: z.enum(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR'], {
    required_error: 'Ürün durumu seçimi gereklidir',
  }),
  images: z
    .array(z.string().url())
    .min(1, 'En az bir görsel gereklidir')
    .max(10, 'En fazla 10 görsel eklenebilir'),
  isTradeEnabled: z.boolean().optional().default(false),
  tradePreferences: z.string().max(500).optional(),
  quantity: z.number().min(1).max(100).optional().default(1),
  brand: z.string().max(50).optional(),
  model: z.string().max(50).optional(),
  tags: z.array(z.string()).max(10).optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const productQuerySchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
  categoryId: z.string().optional(),
  categorySlug: z.string().optional(),
  sellerId: z.string().optional(),
  status: z.enum(['DRAFT', 'PENDING', 'ACTIVE', 'SOLD', 'RESERVED', 'INACTIVE', 'REJECTED']).optional(),
  condition: z.enum(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR']).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  isTradeEnabled: z.coerce.boolean().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['price', 'createdAt', 'viewCount', 'favoriteCount']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductQueryInput = z.infer<typeof productQuerySchema>;
