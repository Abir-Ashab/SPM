# SPM - Smart Product Marketplace with AI Search

An intelligent e-commerce platform featuring AI-powered semantic product search using natural language queries.

## 🚀 Features

- **Semantic Product Search** - Natural language queries to find products (e.g., "show me cameras for photography")
- **AI-Powered Recommendations** - Smart product matching using ONNX embeddings and ChromaDB vector database
- **Product Management** - Full CRUD operations for products with image uploads
- **User Authentication** - Secure JWT-based authentication
- **Order Management** - Place and track orders
- **Responsive UI** - Modern React frontend with Tailwind CSS

## 📋 Prerequisites

- **Node.js** v18+ and npm
- **Python** 3.13 (recommended) or 3.11+
- **Docker Desktop** (or Docker Engine + Docker Compose)
- **Google Gemini API Key** (free tier available at [ai.google.dev](https://ai.google.dev))

## 🛠️ Installation & Setup

### 1. Clone and Navigate
```bash
cd SPM
```

### 2. Backend Setup (Node.js/Express)

```bash
cd backend
npm install
```

Create `.env` file in `backend/` directory:
```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/intern-onboarding
JWT_ACCESS_SECRET=your-secret-access-key
JWT_ACCESS_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-secret-refresh-key
JWT_REFRESH_EXPIRES_IN=30d
BCRYPT_SALT_ROUNDS=12

# MinIO Configuration
MINIO_ENDPOINT=127.0.0.1
MINIO_PORT=9002
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=cefalo
MINIO_SECRET_KEY=iit12345
MINIO_BUCKET_NAME=cefalo-hackathon
```

### 3. ML Backend Setup (Python/FastAPI)

```bash
cd ml-backend
pip install -r requirements.txt
```

Create `.env` file in `ml-backend/` directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

**Getting Gemini API Key:**
1. Visit [https://ai.google.dev](https://ai.google.dev)
2. Sign in with Google account
3. Click "Get API Key" and create a new key
4. Copy the key to your `.env` file

### 4. Frontend Setup (React/Vite)

```bash
cd frontend
npm install
```

No environment configuration needed for frontend (uses localhost defaults).

### 5. Seed Database with Sample Products

```bash
cd backend
npm run seed
```

This will:
- Clear existing products
- Copy product images to `uploads/products/` folder
- Create 3 sample products (Camera, Handbag, Perfume)
- Index products in ChromaDB vector database

## 🚀 Running the Application

**Important:** Start services in separate terminal windows in this order:

### Terminal 1: Start Docker Services (MongoDB + MinIO)
```bash
docker compose up -d mongodb minio
```

Verify containers are running:
```bash
docker compose ps
```

Optional: Start everything in Docker (frontend + backend + ml-backend too):
```bash
docker compose up -d
```

### Terminal 2: Start ML Backend (Port 8000)
```bash
cd ml-backend
python main.py
```

Wait for: `Application startup complete` and `Uvicorn running on http://0.0.0.0:8000`

### Terminal 3: Start Node Backend (Port 3000)
```bash
cd backend
npm start
```

Wait for: `Application initialized successfully` and `Server is running on port 3000`

### Terminal 4: Start Frontend (Port 5173)
```bash
cd frontend
npm run dev
```

Open browser to: **http://localhost:5173**

## 📱 Using the Application

### First Time Setup:
1. Navigate to `http://localhost:5173`
2. Click **Sign Up** to create an account
3. Login with your credentials
4. Access the **Product Assistant** from the chat interface

### Searching Products:
- Click the chat icon to open Product Assistant
- Use **Semantic Search** mode (green button)
- Try queries like:
  - "show me cameras"
  - "I need a luxury handbag"
  - "find me perfume"
  - "what products do you have under $100"
- Click on product cards to view full details
- Products are filtered by relevance using similarity scores

### Managing Products (Admin):
- Use Postman or similar tool to access backend API at `http://localhost:3000/api/products`
- Upload products with images via the products API endpoint

## 🔧 Technology Stack

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **MongoDB** with Mongoose ODM
- **JWT** authentication
- **Zod** for validation
- **MinIO** for object storage (optional)

### ML Backend
- **Python 3.13** with FastAPI
- **ChromaDB** vector database for embeddings
- **ONNX Runtime** for efficient embedding generation (MiniLM-L6-v2 model)
- **Google Gemini Pro** for AI text generation
- No PyTorch dependency (optimized for Python 3.13 compatibility)

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **Axios** for API calls
- **React Router** for navigation
- **React Hot Toast** for notifications

## 📡 API Endpoints

### Backend (http://localhost:3000/api)

**Authentication:**
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

**Products:**
- `GET /products` - Get all products (with filters)
- `GET /products/:id` - Get product by ID
- `POST /products` - Create product
- `PUT /products/:id` - Update product
- `DELETE /products/:id` - Delete product
- `POST /products/search/semantic` - Semantic search products
- `POST /products/upload-image` - Upload product image

**Orders:**
- `GET /orders` - Get user orders
- `POST /orders` - Create order

### ML Backend (http://localhost:8000)

- `POST /search/semantic` - Semantic product search
- `POST /products/index` - Index a product for search
- `GET /health` - Health check

## 🎨 Architecture Highlights

### Semantic Search Flow:
1. User enters natural language query (e.g., "camera for photography")
2. Frontend sends query to backend `/products/search/semantic`
3. Backend forwards to ML service `/search/semantic`
4. ML service:
   - Generates ONNX embedding for query
   - Searches ChromaDB with similarity threshold (0.3)
   - Returns ranked products by relevance
   - Uses Gemini Pro to generate conversational response
5. Frontend displays products sorted by relevance score

### Image Storage:
- Product images stored in `uploads/products/` at workspace root
- Served statically by Express at `/uploads/products/:filename`
- Image URLs stored in MongoDB as full URLs (e.g., `http://localhost:3000/uploads/products/camera.jpg`)

## 📝 Notes

- **Image Search Feature:** Currently disabled as Gemini Vision API is not available in free tier
- **Python Version:** Optimized for Python 3.13 using ONNX Runtime instead of PyTorch for stability
- **Similarity Threshold:** Products with similarity score < 0.3 are filtered out
- **Embeddings:** Using ONNX MiniLM-L6-v2 model (lightweight and fast)
- **Database Runtime:** MongoDB runs in Docker via `docker-compose.yml`
