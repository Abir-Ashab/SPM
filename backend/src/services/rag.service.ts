import axios from 'axios';
import { Material, IMaterial } from '../models/material.model';

const RAG_SERVICE_URL = 'http://localhost:8000';

export class RagService {
  static async indexMaterial(material: { id: number; type: string; content: string; url?: string }): Promise<void> {
    try {
      await axios.post(`${RAG_SERVICE_URL}/index`, material);
    } catch (error) {
      console.error('Error indexing material with RAG service:', error);
      throw new Error('Failed to index material with RAG service');
    }
  }

  static async queryRag(question: string): Promise<{ answer: string; images?: string[] }> {
    try {
      const response = await axios.post(`${RAG_SERVICE_URL}/query`, { question }, {
        timeout: 30000 // 30 second timeout
      });
      
      // Handle the enhanced response format from rag_service_v2
      return {
        answer: response.data.answer || response.data.response || 'No response received',
        images: response.data.images || []
      };
    } catch (error: any) {
      console.error('Error querying RAG service:', error);
      
      // Check if it's a quota error
      if (error.response?.status === 500 && error.response?.data?.detail) {
        const errorDetail = error.response.data.detail;
        
        if (errorDetail.includes('429') || errorDetail.includes('Quota exceeded') || errorDetail.includes('RATE_LIMIT_EXCEEDED')) {
          console.log('Quota limit reached, providing fallback response');
          return {
            answer: this.generateFallbackResponse(question),
            images: []
          };
        }
      }
      
      // Check if it's a network/connection error
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        console.log('RAG service unavailable, providing fallback response');
        return {
          answer: this.generateFallbackResponse(question),
          images: []
        };
      }
      
      // For other errors, still provide a fallback
      return {
        answer: this.generateFallbackResponse(question),
        images: []
      };
    }
  }

  static generateFallbackResponse(question: string): string {
    // Basic fallback responses based on question patterns
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('date') || lowerQuestion.includes('when')) {
      return "I apologize, but I'm currently unable to access the AI service to search through your documents for specific dates. Please check the uploaded documents manually or try again later when the service is available.";
    }
    
    if (lowerQuestion.includes('summary') || lowerQuestion.includes('summarize')) {
      return "I'm currently unable to provide a summary as the AI service is temporarily unavailable due to quota limits. Please try again later or check your documents manually for the key information you need.";
    }
    
    if (lowerQuestion.includes('topic') || lowerQuestion.includes('main') || lowerQuestion.includes('key')) {
      return "I'm currently unable to analyze the main topics in your documents due to AI service limitations. Please review your uploaded documents directly or try again later when the service is restored.";
    }
    
    if (lowerQuestion.includes('action') || lowerQuestion.includes('recommendation') || lowerQuestion.includes('todo')) {
      return "I'm currently unable to extract action items or recommendations from your documents due to service limitations. Please review your documents manually for any actionable items.";
    }
    
    // Generic fallback
    return `I apologize, but I'm currently unable to process your question "${question}" due to AI service quota limitations. The service is temporarily unavailable, but your documents are safely stored. Please try again later or review your uploaded documents manually.`;
  }

  static async submitMaterial(
    materialData: { type: 'file'; content: string },
    userId: string,
    fileMetadata?: { originalName?: string; filename?: string; mimetype?: string; size?: number; url?: string }
  ): Promise<IMaterial> {
    const materialId = Date.now();
    
    console.log('Creating material with data:', {
      id: materialId,
      type: materialData.type,
      content: materialData.content,
      user: userId,
      metadata: fileMetadata
    });
    
    // Save to database
    const material = new Material({
      id: materialId,
      type: materialData.type,
      content: materialData.content,
      originalName: fileMetadata?.originalName,
      filename: fileMetadata?.filename,
      mimetype: fileMetadata?.mimetype,
      size: fileMetadata?.size,
      user: userId
    });
    
    const savedMaterial = await material.save();
    
    // Index with RAG service, including MinIO URL for download
    await this.indexMaterial({
      id: materialId,
      type: materialData.type,
      content: materialData.content,
      url: fileMetadata?.url // Pass MinIO URL to Python service
    });
    
    return savedMaterial;
  }

  static async getUserMaterials(userId: string): Promise<IMaterial[]> {
    return await Material.find({ user: userId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
  }

  static async getAllMaterials(): Promise<IMaterial[]> {
    return await Material.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
  }

  static async generateQuiz(): Promise<any> {
    const quizQuestions = [
      {
        question: 'What is the main topic of your material?',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        answer: 'Option A',
      },
      {
        question: 'What is a key concept mentioned?',
        options: ['Concept 1', 'Concept 2', 'Concept 3', 'Concept 4'],
        answer: 'Concept 1',
      },
    ];
    return quizQuestions;
  }

  static async generateReport(userId: string): Promise<string> {
    const materials = await this.getUserMaterials(userId);
    const report = materials
      .map((m) => `Material (${m.type}): ${m.content.substring(0, 50)}...`)
      .join('<br>');
    return `Learning Report: You submitted ${materials.length} materials.<br>${report}`;
  }
}
