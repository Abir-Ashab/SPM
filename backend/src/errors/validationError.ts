import AppError from './AppError';

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed') {
    super(422, message);
    this.name = 'ValidationError';
  }
}