import { Router } from 'express';
import { RagControllers } from '../controllers/rag.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { ragUploadMiddleware } from '../middlewares/ragUpload.middleware';
import validateRequest from '../middlewares/validateRequest';
import { ragValidations } from '../validations/rag.validation';

const router = Router();

router.post(
  '/upload',
  authMiddleware(),
  ragUploadMiddleware.single('file'),
  RagControllers.submitMaterial
);

router.post(
  '/chat',
  authMiddleware(),
  validateRequest(ragValidations.chatQuery),
  RagControllers.queryChat
);

router.post(
  '/quiz',
  authMiddleware(),
  validateRequest(ragValidations.quizRequest),
  RagControllers.getQuiz
);

router.get(
  '/quiz',
  authMiddleware(),
  RagControllers.getQuiz
);

router.get(
  '/report',
  authMiddleware(),
  RagControllers.getReport
);

router.get(
  '/materials',
  authMiddleware(),
  RagControllers.getUserMaterials
);

router.get(
  '/materials/all',
  authMiddleware(),
  RagControllers.getAllMaterials
);

router.get(
  '/health',
  RagControllers.checkRagHealth
);

router.get(
  '/test-apis',
  RagControllers.testRagApis
);

export default router;
