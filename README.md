# UniGuide AI – Indian University Information Assistant using RAG

> A production-ready, full-stack Retrieval-Augmented Generation (RAG) assistant designed for Indian University students to query official PDF documents (admission guidelines, fee structures, examination rules, syllabus) with **zero hallucinations** and **exact page-level citations**.

---

## 🌟 Key Features

- 📄 **PDF Extraction with Page Metadata**: Uses PyMuPDF (`fitz`) to extract text page-by-page, retaining original document titles and page numbers.
- 🧩 **Context-Aware Chunking**: Splits documents using LangChain's `RecursiveCharacterTextSplitter` (1000 chars, 200 overlap) while maintaining citation lineage.
- ⚡ **High-Performance Vector Search**: Employs `BAAI/bge-large-en-v1.5` embeddings stored persistently in ChromaDB for fast similarity retrieval.
- 🎯 **Strict Anti-Hallucination Guardrails**: Systemic prompt design instructs Google Gemini API to answer strictly from retrieved context and output exact page numbers.
- 📊 **SQLite Metadata Management**: Tracks uploaded documents, page counts, vector index status, and chunk statistics.
- 💻 **Modern React UI**: Premium glassmorphism interface built with React, TypeScript, Vite, and TailwindCSS featuring markdown answer rendering and interactive citation cards.

---

## 🏗️ Project Architecture & Tech Stack

```
UniGuideAI/
├── backend/                  # FastAPI Application
│   ├── app/
│   │   ├── api/v1/endpoints/ # REST Endpoints (/upload, /ingest, /chat, /documents)
│   │   ├── core/             # Configuration & Logging
│   │   ├── models/           # SQLAlchemy Models
│   │   ├── rag/              # Text Splitter, Embeddings, ChromaDB, RAG Pipeline
│   │   ├── schemas/          # Pydantic Request/Response Models
│   │   └── services/         # PyMuPDF PDF Text Service
│   ├── uploads/              # Uploaded PDF Storage
│   ├── chroma_db/            # Persistent ChromaDB Store
│   ├── uniguide.db           # SQLite Metadata Store
│   ├── main.py               # FastAPI App Entrypoint
│   └── requirements.txt      # Python Dependencies
├── frontend/                 # React + TypeScript + Vite Application
│   ├── src/
│   │   ├── components/       # UI Components (Chat, Documents, Citations, Sidebar)
│   │   ├── pages/            # Dashboard, Settings
│   │   ├── services/         # Axios API Client
│   │   └── types/            # TypeScript Interfaces
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

### Technology Stack
- **Frontend**: React 18, TypeScript, Vite, TailwindCSS, Axios, Lucide Icons, React Markdown.
- **Backend**: Python 3.10+, FastAPI, PyMuPDF (fitz), SQLAlchemy, Pydantic v2.
- **RAG & ML**: LangChain, ChromaDB, `BAAI/bge-large-en-v1.5` (via `sentence-transformers`), Google Gemini API (`google-genai`).

---

## 🚀 Quickstart & Setup Guide

### Prerequisites
- Python 3.10 or higher
- Node.js 18 or higher & npm
- Google Gemini API Key ([Get an API key here](https://aistudio.google.com/))

---

### Step 1: Backend Setup

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables:
   Copy `.env.example` to `.env` and add your Google Gemini API key:
   ```bash
   cp .env.example .env
   ```
   Open `.env` and set:
   ```env
   GEMINI_API_KEY="AIzaSyYourActualGeminiApiKeyHere"
   ```

5. Start the FastAPI server:
   ```bash
   python main.py
   ```
   The backend API will run at `http://localhost:8000`. API documentation is available at `http://localhost:8000/docs`.

---

### Step 2: Frontend Setup

1. In a new terminal window, navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install Node dependencies:
   ```bash
   npm install
   ```

3. Launch the Vite development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your web browser.

---

## 🛰️ REST API Endpoints Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/upload` | Uploads a university PDF document to `/uploads` and records metadata in SQLite. |
| `POST` | `/api/v1/ingest` | Extracts text via PyMuPDF, chunks text, generates BAAI embeddings, & stores in ChromaDB. |
| `POST` | `/api/v1/chat` | Runs similarity search, constructs RAG context prompt, queries Gemini LLM, & returns citations. |
| `GET` | `/api/v1/documents` | Lists all uploaded university documents and vector indexing status. |
| `DELETE` | `/api/v1/documents/{id}` | Deletes PDF file, removes document vectors from ChromaDB, and deletes DB metadata. |

---

## 🧪 Example API Query & Response

### Request (`POST /api/v1/chat`)
```json
{
  "question": "What is the fee structure for B.Tech admission?"
}
```

### Response
```json
{
  "answer": "According to the official admission guidelines, the annual tuition fee for the B.Tech program is ₹1,25,000 per academic year, payable in two semester installments.",
  "sources": [
    {
      "document": "Admission_Brochure_2024.pdf",
      "page": 14
    }
  ]
}
```

---

## 🛡️ License

Distributed under the MIT License. See `LICENSE` for details.
