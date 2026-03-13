import api from './api';

export interface Product {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  imageUrl?: string;
}

export interface CreateProductData {
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  imageUrl?: string;
}

export const productService = {
  // Get all products
  getAllProducts: async (filters?: { category?: string; minPrice?: number; maxPrice?: number }): Promise<Product[]> => {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.minPrice) params.append('minPrice', filters.minPrice.toString());
    if (filters?.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
    
    const response = await api.get(`/products?${params.toString()}`);
    return response.data.data;
  },

  // Get product by ID
  getProductById: async (id: string): Promise<Product> => {
    const response = await api.get(`/products/${id}`);
    return response.data.data;
  },

  // Create product
  createProduct: async (productData: CreateProductData): Promise<Product> => {
    const response = await api.post('/products', productData);
    return response.data.data;
  },

  // Update product
  updateProduct: async (id: string, productData: Partial<CreateProductData>): Promise<Product> => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data.data;
  },

  // Delete product
  deleteProduct: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`);
  },

  // Text search (keyword)
  searchProducts: async (query: string): Promise<Product[]> => {
    const response = await api.post('/products/search', { query });
    return response.data.data;
  },

  // Semantic search (AI-powered)
  semanticSearch: async (query: string, topK: number = 5): Promise<{ products: Product[]; response: string }> => {
    const response = await api.post('/products/search/semantic', { query, topK });
    return { products: response.data.data, response: response.data.response || '' };
  },

  // Image search
  imageSearch: async (imageUrl: string, topK: number = 5): Promise<Product[]> => {
    const response = await api.post('/products/search/image', { imageUrl, topK });
    return response.data.data;
  },

  // Batch index products
  batchIndexProducts: async (): Promise<void> => {
    await api.post('/products/index/batch');
  },
};
