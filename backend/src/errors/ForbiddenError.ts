import AppError from './AppError';

export class ForbiddenError extends AppError {
  constructor(message: string = 'Access forbidden') {
    super(403, message);
    this.name = 'ForbiddenError';
  }
}