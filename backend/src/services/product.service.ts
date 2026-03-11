import axios from 'axios';
import { Product } from '../models/product.model';
import { IProduct } from '../models/product.model';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

export class ProductService {
  // Create a new product
  static async createProduct(productData: Partial<IProduct>): Promise<IProduct> {
    const product = await Product.create(productData);

    // Index in ML backend for semantic search
    try {
      await axios.post(`${ML_SERVICE_URL}/products/index`, {
        id: (product._id as any).toString(),
        name: product.name,
        description: product.description,
        category: product.category,
        price: product.price,
        imageUrl: product.imageUrl,
        metadata: product.metadata,
      });
    } catch (error) {
      console.error('Failed to index product in ML backend:', error);
    }

    return product;
  }

  // Get all products
  static async getAllProducts(filters?: any): Promise<IProduct[]> {
    const query: any = {};

    if (filters?.category) {
      query.category = filters.category;
    }

    if (filters?.minPrice || filters?.maxPrice) {
      query.price = {};
      if (filters.minPrice) query.price.$gte = filters.minPrice;
      if (filters.maxPrice) query.price.$lte = filters.maxPrice;
    }

    return await Product.find(query).sort({ createdAt: -1 });
  }

  // Get product by ID
  static async getProductById(productId: string): Promise<IProduct | null> {
    return await Product.findById(productId);
  }

  // Update product
  static async updateProduct(productId: string, updates: Partial<IProduct>): Promise<IProduct | null> {
    const product = await Product.findByIdAndUpdate(productId, updates, { new: true });

    // Re-index in ML backend
    if (product) {
      try {
        await axios.post(`${ML_SERVICE_URL}/products/index`, {
          id: (product._id as any).toString(),
          name: product.name,
          description: product.description,
          category: product.category,
          price: product.price,
          imageUrl: product.imageUrl,
          metadata: product.metadata,
        });
      } catch (error) {
        console.error('Failed to re-index product in ML backend:', error);
      }
    }

    return product;
  }

  // Delete product
  static async deleteProduct(productId: string): Promise<boolean> {
    const result = await Product.findByIdAndDelete(productId);
    return !!result;
  }

  // Search products (text search)
  static async searchProducts(query: string): Promise<IProduct[]> {
    return await Product.find({ $text: { $search: query } });
  }

  // Semantic search using ML backend
  static async semanticSearch(query: string, topK: number = 5): Promise<any[]> {
    try {
      const response = await axios.post(`${ML_SERVICE_URL}/search/semantic`, {
        query,
        topK,
      });
      return response.data.products;
    } catch (error) {
      console.error('Semantic search failed:', error);
      throw new Error('Semantic search failed');
    }
  }

  // Image-based search using ML backend
  static async imageSearch(imageUrl: string, topK: number = 5): Promise<any[]> {
    try {
      const response = await axios.post(`${ML_SERVICE_URL}/search/image`, {
        imageUrl,
        topK,
      });
      return response.data.products;
    } catch (error) {
      console.error('Image search failed:', error);
      throw new Error('Image search failed');
    }
  }

  // Batch index products
  static async batchIndexProducts(): Promise<void> {
    const products = await Product.find();
    
    const productData = products.map(p => ({
      id: (p._id as any).toString(),
      name: p.name,
      description: p.description,
      category: p.category,
      price: p.price,
      imageUrl: p.imageUrl,
      metadata: p.metadata,
    }));

    try {
      await axios.post(`${ML_SERVICE_URL}/products/index_batch`, productData);
      console.log(`Indexed ${products.length} products`);
    } catch (error) {
      console.error('Batch indexing failed:', error);
      throw new Error('Batch indexing failed');
    }
  }
}
