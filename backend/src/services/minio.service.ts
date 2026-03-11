import { Client } from 'minio';
import { Readable } from 'stream';
import multer from 'multer';

interface MinIOConfig {
  endPoint: string;
  port: number;
  useSSL: boolean;
  accessKey: string;
  secretKey: string;
}

interface UploadResult {
  originalName: string;
  filename: string;
  mimetype: string;
  size: number;
  path: string;
  url: string;
}

export class MinIOService {
  private static client: Client;
  private static bucketName = process.env.MINIO_BUCKET_NAME || 'cefalo-hackathon';

  static initialize() {
    const config: MinIOConfig = {
      endPoint: process.env.MINIO_ENDPOINT || '127.0.0.1',
      port: parseInt(process.env.MINIO_PORT || '9002'),
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY || 'cefalo',
      secretKey: process.env.MINIO_SECRET_KEY || 'iit12345',
    };

    this.client = new Client(config);
    
    console.log('MinIO client initialized for browser MinIO:', {
      endPoint: config.endPoint,
      port: config.port,
      useSSL: config.useSSL,
      bucketName: this.bucketName
    });
  }

  static async ensureBucketExists(): Promise<void> {
    try {
      if (!this.client) {
        throw new Error('MinIO client not initialized. Please check your MinIO configuration.');
      }

      const exists = await this.client.bucketExists(this.bucketName);
      if (!exists) {
        await this.client.makeBucket(this.bucketName);
        console.log(`✅ Created bucket: ${this.bucketName} in browser MinIO`);
        
        // Set bucket policy for public read access (optional)
        const policy = {
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: ['*'] },
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${this.bucketName}/*`]
            }
          ]
        };
        
        try {
          await this.client.setBucketPolicy(this.bucketName, JSON.stringify(policy));
          console.log(`Set public read policy for bucket: ${this.bucketName}`);
        } catch (policyError) {
          console.log('Could not set bucket policy (this is optional)');
        }
      } else {
        console.log(`Bucket ${this.bucketName} already exists in browser MinIO`);
      }
    } catch (error) {
      console.error('Error ensuring bucket exists in browser MinIO:', error);
      throw new Error(`Failed to connect to browser MinIO or create bucket: ${error}`);
    }
  }

  static async uploadFile(file: Express.Multer.File): Promise<UploadResult> {
    try {
      if (!this.client) {
        this.initialize();
      }

      await this.ensureBucketExists();

      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const fileExtension = file.originalname.split('.').pop();
      const filename = `${uniqueSuffix}.${fileExtension}`;
      const objectPath = `documents/${filename}`;

      const stream = Readable.from(file.buffer);
      await this.client.putObject(
        this.bucketName,
        objectPath,
        stream,
        file.size,
        {
          'Content-Type': file.mimetype,
          'Original-Name': file.originalname,
        }
      );

      // Generate presigned URL for file access
      const url = await this.client.presignedGetObject(
        this.bucketName,
        objectPath,
        24 * 60 * 60 // 24 hours expiry
      );

      console.log('File uploaded to MinIO:', {
        originalName: file.originalname,
        filename,
        objectPath,
        size: file.size
      });

      return {
        originalName: file.originalname,
        filename,
        mimetype: file.mimetype,
        size: file.size,
        path: objectPath, // MinIO object path
        url: url // Presigned URL for access
      };

    } catch (error) {
      console.error('Error uploading to MinIO:', error);
      throw new Error(`Failed to upload file to MinIO: ${error}`);
    }
  }

  static async getFileUrl(objectPath: string, expirySeconds: number = 24 * 60 * 60): Promise<string> {
    try {
      if (!this.client) {
        this.initialize();
      }

      return await this.client.presignedGetObject(
        this.bucketName,
        objectPath,
        expirySeconds
      );
    } catch (error) {
      console.error('Error generating file URL:', error);
      throw new Error(`Failed to generate file URL: ${error}`);
    }
  }

  static async deleteFile(objectPath: string): Promise<void> {
    try {
      if (!this.client) {
        this.initialize();
      }

      await this.client.removeObject(this.bucketName, objectPath);
      console.log('File deleted from MinIO:', objectPath);
    } catch (error) {
      console.error('Error deleting file from MinIO:', error);
      throw new Error(`Failed to delete file from MinIO: ${error}`);
    }
  }

  static async listFiles(prefix: string = 'documents/'): Promise<any[]> {
    try {
      if (!this.client) {
        this.initialize();
      }

      const objectsStream = this.client.listObjects(this.bucketName, prefix, true);
      const objects: any[] = [];

      return new Promise((resolve, reject) => {
        objectsStream.on('data', (obj) => objects.push(obj));
        objectsStream.on('error', reject);
        objectsStream.on('end', () => resolve(objects));
      });
    } catch (error) {
      console.error('Error listing files from MinIO:', error);
      throw new Error(`Failed to list files from MinIO: ${error}`);
    }
  }

  static async testConnection(): Promise<boolean> {
    try {
      if (!this.client) {
        this.initialize();
      }
      
      // Try to list buckets to test connection
      await this.client.listBuckets();
      console.log('✅ MinIO connection test successful');
      return true;
    } catch (error) {
      console.error('❌ MinIO connection test failed:', error);
      return false;
    }
  }

  static async downloadFile(objectPath: string): Promise<Buffer> {
    try {
      if (!this.client) {
        this.initialize();
      }

      const stream = await this.client.getObject(this.bucketName, objectPath);
      const chunks: Buffer[] = [];

      return new Promise((resolve, reject) => {
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('error', reject);
        stream.on('end', () => resolve(Buffer.concat(chunks)));
      });
    } catch (error) {
      console.error('Error downloading file from MinIO:', error);
      throw new Error(`Failed to download file from MinIO: ${error}`);
    }
  }
}
