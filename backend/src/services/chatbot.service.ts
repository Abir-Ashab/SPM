import axios from 'axios';
import { Conversation } from '../models/conversation.model';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

export class ChatbotService {
  static async processMessage(
    userId: string,
    conversationId: string | null,
    message: string,
    imageUrls: string[] = []
  ): Promise<any> {
    try {
      const response = await axios.post(`${ML_SERVICE_URL}/chat`, {
        message,
        conversationId,
        imageUrls,
      });

      const { response: botResponse, intent, suggestedProducts } = response.data;

      // Save or update conversation
      let conversation;
      if (conversationId) {
        conversation = await Conversation.findById(conversationId);
      }

      if (!conversation) {
        conversation = new Conversation({
          user: userId,
          title: message.substring(0, 50),
          messages: [],
          context: {},
        });
      }

      // Add user message
      conversation.messages.push({
        role: 'user',
        content: message,
        timestamp: new Date(),
        imageUrls,
        extractedEntities: {
          products: intent.products || [],
          quantities: intent.quantities || [],
          intent: intent.intent,
        },
      });

      // Add bot response
      conversation.messages.push({
        role: 'assistant',
        content: botResponse,
        timestamp: new Date(),
      });

      // Update context based on intent
      if (intent.intent === 'order') {
        conversation.context.intent = 'order';
        if (!conversation.context.orderDraft) {
          conversation.context.orderDraft = { items: [] };
        }
      }

      await conversation.save();

      return {
        conversationId: conversation._id,
        response: botResponse,
        intent: intent,
        suggestedProducts,
      };
    } catch (error: any) {
      console.error('Chatbot processing error:', error);
      throw new Error('Failed to process message: ' + error.message);
    }
  }

  // Extract entities from message
  static async extractEntities(message: string, imageUrls: string[] = []): Promise<any> {
    try {
      const response = await axios.post(`${ML_SERVICE_URL}/extract_entities`, {
        message,
        imageUrls,
      });
      return response.data;
    } catch (error) {
      console.error('Entity extraction error:', error);
      throw new Error('Failed to extract entities');
    }
  }

  // Get conversation history
  static async getConversation(conversationId: string): Promise<any> {
    return await Conversation.findById(conversationId);
  }

  // Get user conversations
  static async getUserConversations(userId: string): Promise<any[]> {
    return await Conversation.find({ user: userId, isActive: true })
      .sort({ lastActivity: -1 })
      .select('_id title lastActivity messages');
  }

  // Create order from conversation context
  static async createOrderFromConversation(conversationId: string): Promise<any> {
    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    if (!conversation.context.orderDraft || !conversation.context.orderDraft.items.length) {
      throw new Error('No order draft found in conversation');
    }

    return conversation.context.orderDraft;
  }

  // Update order draft in conversation
  static async updateOrderDraft(
    conversationId: string,
    orderDraft: any
  ): Promise<any> {
    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    conversation.context.orderDraft = orderDraft;
    await conversation.save();

    return conversation;
  }
}
