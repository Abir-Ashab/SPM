import AppError from './AppError';
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized access') {
    super(401, message);
    this.name = 'UnauthorizedError';
  }
}
