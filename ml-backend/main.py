import os
import json
import base64
import tempfile
from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import List, Dict, Optional
from PIL import Image
from io import BytesIO
import logging

from langchain_community.vectorstores import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

app = FastAPI(title="Product Chatbot API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Environment setup
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    logger.error("GEMINI_API_KEY not found in environment variables")
    raise ValueError("GEMINI_API_KEY is required")

# Initialize Gemini
genai.configure(api_key=GEMINI_API_KEY)

# Initialize embedding model for semantic search
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

# Initialize Chroma vector store for products
product_vector_store = Chroma(
    collection_name="products",
    embedding_function=embeddings,
    persist_directory=os.getenv("CHROMA_DB_PATH", "./chroma_db"),
)

# Request/Response Models
class Product(BaseModel):
    id: str
    name: str
    description: str
    category: str
    price: float
    imageUrl: Optional[str] = None
    metadata: Optional[Dict] = {}

class ChatMessage(BaseModel):
    message: str
    conversationId: Optional[str] = None
    imageUrls: Optional[List[str]] = []

class IntentResponse(BaseModel):
    intent: str  # inquiry, order, pricing, availability
    entities: Dict
    confidence: float

class SemanticSearchRequest(BaseModel):
    query: str
    topK: int = 5

class ImageSearchRequest(BaseModel):
    imageUrl: str
    topK: int = 5

# Helper Functions
def encode_image_to_base64(image_url: str) -> str:
    """Download and encode image to base64."""
    try:
        import requests
        response = requests.get(image_url, timeout=10)
        response.raise_for_status()
        return base64.b64encode(response.content).decode('utf-8')
    except Exception as e:
        logger.error(f"Failed to encode image: {e}")
        raise HTTPException(status_code=400, detail=f"Failed to process image: {str(e)}")

def extract_intent_and_entities(message: str, image_urls: List[str] = None) -> Dict:
    """Use Gemini to extract intent and entities from customer message."""
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        prompt = f"""
Analyze the following customer message and extract:
1. Intent: (inquiry/order/pricing/availability/greeting/other)
2. Product names or descriptions mentioned
3. Quantities if mentioned
4. Any specific preferences or requirements

Message: "{message}"

Return as JSON:
{{
    "intent": "string",
    "products": ["list of product names/descriptions"],
    "quantities": [list of numbers],
    "preferences": ["list of preferences"],
    "confidence": 0.0-1.0
}}
"""
        
        if image_urls:
            # Multimodal understanding with images
            prompt += f"\nThe customer also shared {len(image_urls)} product image(s)."
        
        response = model.generate_content(prompt)
        result = json.loads(response.text.strip().replace('```json', '').replace('```', ''))
        return result
    except Exception as e:
        logger.error(f"Intent extraction failed: {e}")
        return {
            "intent": "other",
            "products": [],
            "quantities": [],
            "preferences": [],
            "confidence": 0.0
        }

def semantic_product_search(query: str, top_k: int = 5) -> List[Dict]:
    """Search products using semantic similarity."""
    try:
        results = product_vector_store.similarity_search_with_score(query, k=top_k)
        products = []
        for doc, score in results:
            products.append({
                "id": doc.metadata.get("id"),
                "name": doc.metadata.get("name"),
                "description": doc.page_content,
                "category": doc.metadata.get("category"),
                "price": doc.metadata.get("price"),
                "similarity_score": float(1 - score)  # Convert distance to similarity
            })
        return products
    except Exception as e:
        logger.error(f"Semantic search failed: {e}")
        return []

def image_based_search(image_url: str, top_k: int = 5) -> List[Dict]:
    """Search products using image similarity with Gemini vision."""
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Use Gemini to describe the image
        response = model.generate_content([
            "Describe this product image in detail, including its type, color, features, and any visible text or branding.",
            {"mime_type": "image/jpeg", "data": encode_image_to_base64(image_url)}
        ])
        
        image_description = response.text
        logger.info(f"Image description: {image_description}")
        
        # Use the description for semantic search
        return semantic_product_search(image_description, top_k)
        
    except Exception as e:
        logger.error(f"Image search failed: {e}")
        raise HTTPException(status_code=500, detail=f"Image search failed: {str(e)}")

def generate_chatbot_response(message: str, intent_data: Dict, relevant_products: List[Dict]) -> str:
    """Generate natural language response using Gemini."""
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        products_info = "\n".join([
            f"- {p['name']}: {p['description']} (${p['price']})"
            for p in relevant_products[:3]
        ]) if relevant_products else "No products found"
        
        prompt = f"""
You are a helpful product sales assistant. 

Customer message: "{message}"
Intent: {intent_data.get('intent', 'other')}
Extracted entities: {intent_data.get('products', [])}

Relevant products from catalog:
{products_info}

Generate a helpful, friendly response that:
1. Acknowledges the customer's request
2. Provides relevant product information
3. Asks clarifying questions if needed
4. Guides them toward making an order if appropriate

Keep the response conversational and helpful.
"""
        
        response = model.generate_content(prompt)
        return response.text
        
    except Exception as e:
        logger.error(f"Response generation failed: {e}")
        return "I apologize, but I'm having trouble processing your request. Could you please rephrase?"

# API Endpoints

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "gemini_available": bool(GEMINI_API_KEY),
        "vector_store": "available"
    }

@app.post("/products/index")
async def index_product(product: Product):
    """Index a product in the vector store."""
    try:
        from langchain_core.documents import Document
        
        # Create document with product info
        doc_content = f"{product.name}. {product.description}"
        metadata = {
            "id": product.id,
            "name": product.name,
            "category": product.category,
            "price": product.price,
        }
        
        doc = Document(page_content=doc_content, metadata=metadata)
        product_vector_store.add_documents([doc])
        
        logger.info(f"Indexed product: {product.name}")
        return {"message": "Product indexed successfully", "productId": product.id}
    except Exception as e:
        logger.error(f"Product indexing failed: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to index product: {str(e)}")

@app.post("/products/index_batch")
async def index_products_batch(products: List[Product]):
    """Index multiple products at once."""
    try:
        from langchain_core.documents import Document
        
        docs = []
        for product in products:
            doc_content = f"{product.name}. {product.description}"
            metadata = {
                "id": product.id,
                "name": product.name,
                "category": product.category,
                "price": product.price,
            }
            docs.append(Document(page_content=doc_content, metadata=metadata))
        
        product_vector_store.add_documents(docs)
        
        logger.info(f"Indexed {len(products)} products")
        return {"message": f"Indexed {len(products)} products successfully"}
    except Exception as e:
        logger.error(f"Batch indexing failed: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to index products: {str(e)}")

@app.post("/chat")
async def chat(request: ChatMessage):
    """Main chatbot endpoint with NLU, intent recognition, and multimodal understanding."""
    try:
        # Extract intent and entities
        intent_data = extract_intent_and_entities(request.message, request.imageUrls)
        
        # Find relevant products based on extracted entities and message
        relevant_products = []
        
        # Text-based search
        if intent_data.get('products'):
            for product_query in intent_data['products']:
                results = semantic_product_search(product_query, top_k=3)
                relevant_products.extend(results)
        else:
            # General semantic search with the full message
            relevant_products = semantic_product_search(request.message, top_k=5)
        
        # Image-based search if images provided
        if request.imageUrls:
            for image_url in request.imageUrls:
                image_results = image_based_search(image_url, top_k=3)
                relevant_products.extend(image_results)
        
        # Remove duplicates
        seen_ids = set()
        unique_products = []
        for p in relevant_products:
            if p['id'] not in seen_ids:
                seen_ids.add(p['id'])
                unique_products.append(p)
        
        # Generate response
        response_text = generate_chatbot_response(
            request.message,
            intent_data,
            unique_products
        )
        
        return {
            "response": response_text,
            "intent": intent_data,
            "suggestedProducts": unique_products[:5],
            "conversationId": request.conversationId or "new"
        }
        
    except Exception as e:
        logger.error(f"Chat processing failed: {e}")
        raise HTTPException(status_code=500, detail=f"Chat processing failed: {str(e)}")

@app.post("/search/semantic")
async def semantic_search(request: SemanticSearchRequest):
    """Semantic search endpoint."""
    try:
        products = semantic_product_search(request.query, request.topK)
        return {"products": products}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@app.post("/search/image")
async def image_search(request: ImageSearchRequest):
    """Image-based product search endpoint."""
    try:
        products = image_based_search(request.imageUrl, request.topK)
        return {"products": products}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image search failed: {str(e)}")

@app.post("/extract_entities")
async def extract_entities(request: ChatMessage):
    """Extract entities and intent from message."""
    try:
        result = extract_intent_and_entities(request.message, request.imageUrls)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Entity extraction failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
