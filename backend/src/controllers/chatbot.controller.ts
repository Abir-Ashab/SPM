import { Request, Response } from 'express';
import { ChatbotService } from '../services/chatbot.service';
import { catchAsync } from '../utils/catchAsync.util';

export const chat = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'User authentication required',
    });
  }

  const { message, conversationId, imageUrls } = req.body;

  if (!message) {
    return res.status(400).json({
      success: false,
      message: 'Message is required',
    });
  }

  const result = await ChatbotService.processMessage(
    userId,
    conversationId || null,
    message,
    imageUrls || []
  );

  res.status(200).json({
    success: true,
    data: result,
  });
});

export const extractEntities = catchAsync(async (req: Request, res: Response) => {
  const { message, imageUrls } = req.body;

  if (!message) {
    return res.status(400).json({
      success: false,
      message: 'Message is required',
    });
  }

  const entities = await ChatbotService.extractEntities(message, imageUrls || []);

  res.status(200).json({
    success: true,
    data: entities,
  });
});

export const getConversation = catchAsync(async (req: Request, res: Response) => {
  const conversation = await ChatbotService.getConversation(req.params.id);

  if (!conversation) {
    return res.status(404).json({
      success: false,
      message: 'Conversation not found',
    });
  }

  res.status(200).json({
    success: true,
    data: conversation,
  });
});

export const getUserConversations = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'User authentication required',
    });
  }

  const conversations = await ChatbotService.getUserConversations(userId);

  res.status(200).json({
    success: true,
    data: conversations,
  });
});

export const getOrderDraft = catchAsync(async (req: Request, res: Response) => {
  const orderDraft = await ChatbotService.createOrderFromConversation(req.params.conversationId);

  res.status(200).json({
    success: true,
    data: orderDraft,
  });
});

export const updateOrderDraft = catchAsync(async (req: Request, res: Response) => {
  const { conversationId } = req.params;
  const { orderDraft } = req.body;

  const conversation = await ChatbotService.updateOrderDraft(conversationId, orderDraft);

  res.status(200).json({
    success: true,
    data: conversation,
  });
});
