import { z } from 'zod';

export const submitMaterialValidation = z.object({
  body: z.object({}).optional(), // No body validation needed for file uploads
});

export const chatQueryValidation = z.object({
  body: z.object({
    question: z.string().min(1, "Question is required"),
  }),
});


export const QuizRequestValidation = z.object({
  body: z.object({
    material_id: z.coerce.string().min(1, 'Material ID is required'),
    num_questions: z.coerce.number().int().min(1).default(3).optional(),
  }),
});
export const ragValidations = {
  submitMaterial: submitMaterialValidation,
  chatQuery: chatQueryValidation,
  quizRequest: QuizRequestValidation
};


