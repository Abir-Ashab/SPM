export interface FileUploadResponse {
  url: string;
  public_id: string;
}

export interface UploadFileRequest {
  file: Express.Multer.File;
}