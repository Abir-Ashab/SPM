import { Request, Response } from 'express';
import axios from 'axios';
import { RagService } from '../services/rag.service';
import { MinIOService } from '../services/minio.service';
import { catchAsync } from '../utils/catchAsync.util';

const RAG_SERVICE_URL = 'http://localhost:8000';

const submitMaterial = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'User authentication required'
    });
  }

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'File is required'
    });
  }

  console.log('File info:', {
    originalname: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size
  });

  // Upload file to MinIO
  const uploadResult = await MinIOService.uploadFile(req.file);

  const materialData = { 
    type: 'file' as const, 
    content: uploadResult.path // MinIO object path
  };

  const fileMetadata = {
    originalName: uploadResult.originalName,
    filename: uploadResult.filename,
    mimetype: uploadResult.mimetype,
    size: uploadResult.size,
    url: uploadResult.url // MinIO URL
  };

  const material = await RagService.submitMaterial(materialData, userId, fileMetadata);

  console.log('Material created successfully:', {
    id: material.id,
    originalName: material.originalName,
    filename: material.filename,
    type: material.type,
    minioPath: uploadResult.path
  });

  res.status(201).json({
    success: true,
    data: material,
    message: 'Material submitted and indexed successfully'
  });
});

const queryChat = catchAsync(async (req: Request, res: Response) => {
  const { question } = req.body;
  
  if (!question) {
    return res.status(400).json({
      response: {
        answer: 'Question is required',
        images: []
      }
    });
  }

  try {
    const result = await RagService.queryRag(question);
    
    // Return in the format expected by EnhancedChat component
    res.json({
      response: {
        answer: result.answer,
        images: result.images || []
      }
    });
  } catch (error) {
    console.error('Error in queryChat controller:', error);
    res.json({
      response: {
        answer: 'Sorry, I could not process your question at the moment. Please try again later.',
        images: []
      }
    });
  }
});

const checkRagHealth = catchAsync(async (req: Request, res: Response) => {
  try {
    const healthResponse = await axios.get(`${RAG_SERVICE_URL}/health`, {
      timeout: 5000
    });
    
    res.json({
      success: true,
      message: 'RAG service is healthy',
      data: healthResponse.data
    });
  } catch (error: any) {
    console.error('RAG service health check failed:', error.message);
    res.status(503).json({
      success: false,
      message: 'RAG service is unavailable',
      error: error.message
    });
  }
});

const testRagApis = catchAsync(async (req: Request, res: Response) => {
  try {
    const testResponse = await axios.get(`${RAG_SERVICE_URL}/test-apis`, {
      timeout: 10000
    });
    
    res.json({
      success: true,
      message: 'RAG service API test completed',
      data: testResponse.data
    });
  } catch (error: any) {
    console.error('RAG service API test failed:', error.message);
    res.status(503).json({
      success: false,
      message: 'RAG service API test failed',
      error: error.message
    });
  }
});

const getQuiz = catchAsync(async (req: Request, res: Response) => {
  const quiz = await RagService.generateQuiz();

  res.json({
    success: true,
    data: quiz,
    message: 'Quiz generated successfully'
  });
});

const getReport = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'User authentication required'
    });
  }

  const report = await RagService.generateReport(userId);

  res.json({
    success: true,
    data: { report },
    message: 'Report generated successfully'
  });
});

const getUserMaterials = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'User authentication required'
    });
  }

  const materials = await RagService.getUserMaterials(userId);

  res.json({
    success: true,
    data: materials,
    message: 'Materials retrieved successfully'
  });
});

const getAllMaterials = catchAsync(async (req: Request, res: Response) => {
  console.log('getAllMaterials called');
  const materials = await RagService.getAllMaterials();
  console.log('Materials found:', materials.length);
  console.log('Sample material:', materials[0]);

  res.json({
    success: true,
    data: materials,
    message: 'All materials retrieved successfully'
  });
});

export const RagControllers = {
  submitMaterial,
  queryChat,
  getQuiz,
  getReport,
  getUserMaterials,
  getAllMaterials,
  checkRagHealth,
  testRagApis
};
