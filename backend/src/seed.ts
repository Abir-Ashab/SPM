import mongoose from 'mongoose';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import config from './config/index.js';
import { Product } from './models/product.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Seed data with detailed descriptions for semantic search
const seedProducts = [
  {
    name: 'Professional DSLR Camera',
    description: 'High-end professional digital camera with advanced autofocus system, 4K video recording, weather-sealed body, and exceptional low-light performance. Perfect for professional photographers, wildlife photography, portrait sessions, and video content creators. Features fast continuous shooting, versatile lens compatibility, and intuitive controls.',
    category: 'electronics',
    price: 1299.99,
    stock: 15,
    imageFile: 'camera.jpg',
    tags: ['photography', 'camera', 'DSLR', 'professional', '4K', 'video', 'digital camera']
  },
  {
    name: 'Luxury Designer Handbag',
    description: 'Premium leather handbag with elegant design, spacious interior compartments, and gold-tone hardware. Crafted from genuine Italian leather with meticulous attention to detail. Features multiple pockets for organization, adjustable shoulder strap, and timeless style perfect for both casual and formal occasions. Ideal accessory for fashion-conscious women.',
    category: 'clothing',
    price: 299.99,
    stock: 8,
    imageFile: 'bag.jpg',
    tags: ['fashion', 'handbag', 'luxury', 'leather', 'designer', 'accessories', 'women']
  },
  {
    name: 'Premium French Perfume',
    description: 'Exquisite eau de parfum with sophisticated blend of floral and woody notes. Top notes of bergamot and jasmine, heart notes of rose and iris, base notes of sandalwood and vanilla. Long-lasting fragrance perfect for special occasions or everyday elegance. Housed in an elegant glass bottle with minimalist design. Ideal gift for perfume lovers.',
    category: 'other',
    price: 89.99,
    stock: 25,
    imageFile: 'perfume.jpg',
    tags: ['perfume', 'fragrance', 'luxury', 'French', 'eau de parfum', 'gift', 'beauty']
  }
];

async function clearExistingData() {
  console.log('🗑️  Clearing existing products from database...');
  const result = await Product.deleteMany({});
  console.log(`   Deleted ${result.deletedCount} products`);

  console.log('🗑️  Clearing uploads folder...');
  const uploadsDir = path.join(__dirname, '../../../uploads/products');
  try {
    const files = await fs.readdir(uploadsDir);
    for (const file of files) {
      // Only delete uploaded files, not the seed images
      if (!['camera.jpg', 'bag.jpg', 'perfume.jpg'].includes(file)) {
        await fs.unlink(path.join(uploadsDir, file));
      }
    }
    console.log(`   Kept seed images in uploads folder`);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      console.log('   Uploads folder does not exist, creating...');
      await fs.mkdir(uploadsDir, { recursive: true });
    } else {
      throw error;
    }
  }
}

async function copyProductImages() {
  console.log('📁 Ensuring product images exist...');
  const sourceDir = path.join(__dirname, '../../../Products');
  const targetDir = path.join(__dirname, '../../../uploads/products');

  await fs.mkdir(targetDir, { recursive: true });

  for (const product of seedProducts) {
    const targetPath = path.join(targetDir, product.imageFile);
    
    try {
      // Check if image already exists
      await fs.access(targetPath);
      console.log(`   ✓ Image exists: ${product.imageFile}`);
    } catch {
      // Image doesn't exist, copy it
      const sourcePath = path.join(sourceDir, product.imageFile);
      try {
        await fs.copyFile(sourcePath, targetPath);
        console.log(`   ✓ Copied ${product.imageFile}`);
      } catch (error) {
        console.error(`   ✗ Failed to copy ${product.imageFile}:`, error);
        throw error;
      }
    }
  }
}

async function indexProductInML(productData: any, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axios.post(
        'http://localhost:8000/products/index',
        {
          id: productData._id.toString(),
          name: productData.name,
          description: productData.description,
          category: productData.category,
          price: productData.price,
          imageUrl: productData.imageUrl,
          metadata: {
            tags: productData.tags || []
          }
        },
        {
          timeout: 30000, // 30 second timeout
          headers: { 'Content-Type': 'application/json' }
        }
      );
      console.log(`   ✓ Indexed in ML backend: ${productData.name}`);
      return response.data;
    } catch (error: any) {
      if (error.code === 'ECONNREFUSED') {
        console.warn(`   ⚠ ML backend not running - skipping indexing for: ${productData.name}`);
        break; // Don't retry if connection refused
      } else if (attempt < retries) {
        console.warn(`   ⚠ Retry ${attempt}/${retries - 1} for: ${productData.name}`);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
      } else {
        console.error(`   ✗ Failed to index ${productData.name} after ${retries} attempts:`, error.message);
      }
    }
  }
}

async function createProducts() {
  console.log('📦 Creating products...');
  const createdProducts = [];

  for (const productData of seedProducts) {
    const imageUrl = `http://localhost:3000/uploads/products/${productData.imageFile}`;
    
    const product = new Product({
      name: productData.name,
      description: productData.description,
      category: productData.category,
      price: productData.price,
      stock: productData.stock,
      imageUrl: imageUrl
    });

    const savedProduct = await product.save();
    console.log(`   ✓ Created: ${savedProduct.name} (ID: ${savedProduct._id})`);

    // Index in ML backend
    await indexProductInML({
      _id: savedProduct._id,
      name: savedProduct.name,
      description: savedProduct.description,
      category: savedProduct.category,
      price: savedProduct.price,
      imageUrl: savedProduct.imageUrl,
      tags: productData.tags
    });

    createdProducts.push(savedProduct);
  }

  return createdProducts;
}

async function seed() {
  console.log('🌱 Starting database seed...\n');

  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(config.db_url!);
    console.log('   ✓ Connected to MongoDB\n');

    // Clear existing data
    await clearExistingData();
    console.log('');

    // Copy images
    await copyProductImages();
    console.log('');

    // Create products
    const products = await createProducts();
    console.log('');

    console.log('✅ Seed completed successfully!');
    console.log(`   Created ${products.length} products`);
    console.log('\n📊 Summary:');
    products.forEach(p => {
      console.log(`   • ${p.name} - $${p.price} (${p.stock} in stock)`);
    });

  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

seed();
