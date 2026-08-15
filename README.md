# Oriva: Code-Review-RAG (Client)

![Oriva UI](https://via.placeholder.com/1200x600?text=Oriva+Code+Review+RAG)

## 🚀 The Problem It Solves
Modern codebases are massive and complex. When developers join a new project or attempt to debug a systemic issue, they spend hours reading through disconnected files, tracing dependencies, and trying to understand architectural patterns. Traditional AI tools lack full context—they only understand the specific snippets you paste into them.

**Oriva** solves this by acting as a highly intelligent, context-aware Principal Engineer. By ingesting your entire codebase (either via ZIP upload or public/private GitHub repositories) and storing it in a vector database, Oriva allows you to chat directly with your entire codebase. It instantly understands the structure, dependencies, and logic of your code, enabling you to identify architectural flaws, generate specialized IDE prompts to fix bugs, and onboard onto new projects in minutes.

## ✨ Key Features
- **Intelligent RAG Engine**: Combines Google's Gemini LLM with Pinecone Vector DB to answer questions with deep context spanning your entire codebase.
- **GitHub PAT Support**: Securely ingest both public and private GitHub repositories using Personal Access Tokens.
- **"Get Prompt for Fix" AI Generator**: When the AI finds an issue, one click generates a token-optimized, persona-driven prompt tailored for specific IDEs (Cursor, VS Code Copilot, Claude, Antigravity).
- **End-to-End Payload Encryption**: Zero data leakage. All sensitive requests and API responses are encrypted using AES-256 (`CryptoJS`) before traversing the network.
- **Instant Demo Mode**: "Skip Login" capability for users who want to bypass backend authentication and test the UI/UX instantly.
- **Smart Error Handling**: Clear, user-friendly UI errors directly piped from the backend to the frontend (e.g., catching missing GitHub PAT permissions).
- **Rich Markdown UI**: Beautiful glassmorphism UI with Tailwind CSS, rendering syntax-highlighted code blocks, tables, and AI reference sources gracefully.

## 🛠 Tech Stack
- **Frontend**: React.js (Vite), Tailwind CSS, Lucide React, React-Markdown.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (via Mongoose) for user/project metadata.
- **Vector Database (RAG)**: Pinecone.
- **AI / LLM**: Google Generative AI (Gemini 1.5 Pro/Flash).
- **Security**: CryptoJS (AES-256 Symmetric Encryption), JWT Authentication, bcryptjs.
- **File Processing**: `multer`, `adm-zip`, `simple-git`.

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd Code-Review-RAG-Client
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env` file in the root directory:
   ```env
   VITE_API_URL=http://localhost:8000/api/v1
   VITE_ENCRYPTION_SECRET=your_super_secret_encryption_key_here
   ```
   > **Note:** The `VITE_ENCRYPTION_SECRET` must exactly match the `ENCRYPTION_SECRET` set in the backend server to ensure payloads can be encrypted/decrypted successfully.

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`.

## 📁 Project Structure Highlights

- `src/pages/ChatPage.jsx`: The core interactive workspace containing the messaging interface, project setup wizard, and the "Get Prompt for Fix" modal.
- `src/lib/api.js`: Contains the Axios instance with custom request/response interceptors that automatically handle AES payload masking.
- `src/lib/encryption.js`: Utility functions utilizing `CryptoJS` for symmetric encryption.

## 🔒 Security Architecture

Oriva takes security seriously. Rather than sending raw JSON payloads, the client intercepts HTTP requests via Axios. It stringifies the payload, encrypts it using `CryptoJS.AES.encrypt` with a shared secret, and sends it to the server wrapped in a single `encryptedData` field. The server does the exact same process in reverse for its responses, ensuring that the browser's network tab reveals no sensitive contextual information.
