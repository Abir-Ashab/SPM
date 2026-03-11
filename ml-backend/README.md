# ML Backend - RAG Service

This is the Machine Learning backend for the Intern Onboarding Assistant, specifically handling RAG (Retrieval-Augmented Generation) functionality for document processing and question answering.

## Features

- **Document Processing**: Support for PDF, TXT files, and web URLs
- **Vector Storage**: Uses Chroma for efficient document retrieval
- **LLM Integration**: Google Gemini for enhanced question answering
- **RESTful API**: FastAPI-based service for easy integration

## Setup

### Prerequisites

- Python 3.8+
- pip package manager

### Installation

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Set up environment variables:
Create a `.env` file in this directory with:
```
GEMINI_API_KEY=your_gemini_api_key_here
```

### Running the Service

```bash
python rag_service.py
```

The service will start on `http://localhost:8000`

## API Endpoints

### POST /index
Index a new document/material for retrieval.

**Request Body:**
```json
{
  "id": 1,
  "type": "file|url|text",
  "content": "path/to/file or URL or text content"
}
```

### POST /query
Query the indexed documents with a question.

**Request Body:**
```json
{
  "question": "Your question here"
}
```

**Response:**
```json
{
  "answer": "Generated answer based on indexed documents"
}
```

## File Structure

- `rag_service.py` - Main FastAPI application with RAG functionality
- `requirements.txt` - Python dependencies
- `chroma_db/` - Vector database storage
- `uploads/` - Uploaded document files
- `.env` - Environment variables (not in git)

## Technologies Used

- **FastAPI** - Web framework
- **LangChain** - LLM orchestration framework
- **Chroma** - Vector database
- **HuggingFace Embeddings** - Text embeddings
- **Google Gemini** - Large Language Model
- **Sentence Transformers** - Text similarity
