import { Router } from 'express';
import * as productController from '../controllers/product.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Public routes
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.post('/search', productController.searchProducts);

// ML-powered search endpoints
router.post('/search/semantic', productController.semanticSearch);
router.post('/search/image', productController.imageSearch);

// Protected routes (require authentication)
router.post('/', authMiddleware(), productController.createProduct);
router.put('/:id', authMiddleware(), productController.updateProduct);
router.delete('/:id', authMiddleware(), productController.deleteProduct);

// Admin routes
router.post('/index/batch', authMiddleware(), productController.batchIndexProducts);

export default router;
