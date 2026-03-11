import AppError from './AppError';

export class ConflictError extends AppError {
  constructor(message: string = 'Conflict occurred') {
    super(409, message);
    this.name = 'ConflictError';
  }
}