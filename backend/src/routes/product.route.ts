import { Router } from 'express';
import * as productController from '../controllers/product.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { uploadMiddleware } from '../middlewares/upload.middleware';
import fs from 'fs/promises';
import path from 'path';

const router = Router();

// Public routes
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.post('/search', productController.searchProducts);

// ML-powered search endpoints
router.post('/search/semantic', productController.semanticSearch);
router.post('/search/image', productController.imageSearch);

// Image upload endpoint (local file storage)
router.post('/upload-image', authMiddleware(), uploadMiddleware.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image uploaded' });
    }
    
    // Create uploads directory if it doesn't exist (workspace root uploads folder)
    const uploadsDir = path.join(process.cwd(), '..', 'uploads', 'products');
    await fs.mkdir(uploadsDir, { recursive: true });
    
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = req.file.originalname.split('.').pop();
    const filename = `${uniqueSuffix}.${fileExtension}`;
    const filePath = path.join(uploadsDir, filename);
    
    // Write file to disk
    await fs.writeFile(filePath, req.file.buffer);
    
    // Generate URL (assumes uploads folder is served statically)
    const url = `http://localhost:3000/uploads/products/${filename}`;
    
    console.log('File uploaded locally:', { filename, url });
    
    res.status(200).json({
      success: true,
      data: {
        url: url,
        filename: filename,
      },
    });
  } catch (error: any) {
    console.error('Image upload failed:', error);
    res.status(500).json({ success: false, message: 'Image upload failed' });
  }
});

// Protected routes (require authentication)
router.post('/', authMiddleware(), productController.createProduct);
router.put('/:id', authMiddleware(), productController.updateProduct);
router.delete('/:id', authMiddleware(), productController.deleteProduct);

// Admin routes
router.post('/index/batch', authMiddleware(), productController.batchIndexProducts);

export default router;
