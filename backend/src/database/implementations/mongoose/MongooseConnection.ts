import mongoose from 'mongoose';
import dbConfig from '../../../config/database';

class MongooseConnection {
  private client: typeof mongoose | null = null;
  private connected: boolean = false;

  async connect(): Promise<void> {
    try {
      
      this.client = await mongoose.connect(dbConfig.mongodb.uri);
      this.connected = true;
      
      
      // Set up connection event listeners
      mongoose.connection.on('error', (error) => {
        console.error('MongoDB connection error:', error);
        this.connected = false;
      });
      
      mongoose.connection.on('disconnected', () => {
        this.connected = false;
      });
      
      mongoose.connection.on('reconnected', () => {
        this.connected = true;
      });
      
    } catch (error) {
      this.connected = false;
      console.error('MongoDB connection failed:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.client) {
        await mongoose.disconnect();
        this.client = null;
        this.connected = false;
      }
    } catch (error) {
      console.error('MongoDB disconnection failed:', error);
      throw error;
    }
  }

  isConnected(): boolean {
    return this.connected && mongoose.connection.readyState === 1;
  }

  getClient() {
    if (!this.client) {
      throw new Error('MongoDB not connected');
    }
    return this.client;
  }

  async testConnection(): Promise<any> {
    try {
      if (!this.isConnected()) {
        throw new Error('MongoDB not connected');
      }
      
      // Simple ping to test connection
      if (mongoose.connection.db) {
        await mongoose.connection.db.admin().ping();
      }
      
      return {
        status: 'Connected',
        database: mongoose.connection.name,
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        readyState: mongoose.connection.readyState
      };
    } catch (error) {
      console.error('MongoDB connection test failed:', error);
      throw error;
    }
  }

  getConnectionInfo() {
    return {
      status: this.connected ? 'Connected' : 'Disconnected',
      orm: 'mongoose',
      type: 'mongodb',
      database: mongoose.connection.name,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      readyState: mongoose.connection.readyState,
      readyStateText: this.getReadyStateText(mongoose.connection.readyState)
    };
  }

  private getReadyStateText(state: number): string {
    switch (state) {
      case 0: return 'disconnected';
      case 1: return 'connected';
      case 2: return 'connecting';
      case 3: return 'disconnecting';
      default: return 'unknown';
    }
  }

  // For MongoDB, migrations are not typically used like in SQL databases
  // But we keep these methods for compatibility with the interface
  async runMigrations(): Promise<any> {
    console.log('MongoDB does not use traditional migrations. Skipping...');
    return { message: 'MongoDB does not use traditional migrations' };
  }

  async rollbackMigrations(): Promise<any> {
    console.log('MongoDB does not use traditional migrations. Skipping...');
    return { message: 'MongoDB does not use traditional migrations' };
  }
}

export default MongooseConnection;
