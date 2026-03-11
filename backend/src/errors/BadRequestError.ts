import AppError from './AppError';

export class BadRequestError extends AppError {
  constructor(message: string = 'Bad request') {
    super(400, message);
    this.name = 'BadRequestError';
  }
}