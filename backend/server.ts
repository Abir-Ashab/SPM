import { initialize } from './src/database';
import { config } from 'dotenv';
import express from "express";
import path from "path";
import { fileURLToPath } from 'url';
import globalErrorHandler from "./src/middlewares/globalErrorHandler";
import notFound from "./src/middlewares/notFound";
import { UserRoutes } from "./src/routes/user.route";
import { AuthRoutes } from "./src/routes/auth.route";
import productRoutes from "./src/routes/product.route";
import chatbotRoutes from "./src/routes/chatbot.route";
import orderRoutes from "./src/routes/order.route";
import dashboardRoutes from "./src/routes/dashboard.route";
import { MinIOService } from "./src/services/minio.service";
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config(); 
const app = express();
app.use(express.json());
app.use(cors());

// Serve uploaded files statically from workspace root uploads folder
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const PORT = process.env.PORT || 3000;
const startServer = async () => {
  try {
    await initialize();
    
    // Initialize MinIO service
    MinIOService.initialize();
    
    console.log('Application initialized successfully');
    app.use("/api/auth", AuthRoutes);
    app.use("/api/users", UserRoutes);
    app.use("/api/products", productRoutes);
    app.use("/api/chatbot", chatbotRoutes);
    app.use("/api/orders", orderRoutes);
    app.use("/api/dashboard", dashboardRoutes);
    app.get('/api/health', (req, res) => {
      res.json({ status: 'ok', message: 'Product Chatbot API is running' });
    });
  } catch (error) {
    console.error('Application initialization failed:', error.message);
    process.exit(1);
  }
  app.use(notFound);
  app.use(globalErrorHandler);

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
