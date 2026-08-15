# Oriva: Code-Review-RAG (Client)

![Oriva UI](https://via.placeholder.com/1200x600?text=Oriva+Code+Review+RAG)

Oriva is an advanced AI-powered codebase analysis and chat assistant. This repository contains the Frontend Client, built with a heavy emphasis on a premium, glassmorphism UI, secure data handling, and seamless developer experience.

## Key Features

- **Premium UI/UX**: Designed with a sleek dark/light mode aesthetic using **Tailwind CSS**, smooth micro-animations, and custom glassmorphism components.
- **End-to-End Payload Encryption**: Utilizes `CryptoJS` to securely encrypt all sensitive outgoing data (like credentials) and decrypt all incoming API responses using AES-256 symmetric encryption, completely masking network traffic.
- **"Get Prompt for Fix" AI Generator**: When the RAG engine identifies a codebase issue, users can instantly generate a highly tailored, persona-driven prompt (e.g., "Principal Architect") formatted specifically for tools like VS Code Copilot, Cursor, or Claude.
- **Flexible Codebase Ingestion**: Users can provide context to the AI by either uploading a `.zip` file of their codebase or providing a public GitHub repository URL.
- **Intelligent Markdown Chat**: The chat interface fully supports rendering GitHub Flavored Markdown, syntax-highlighted code blocks, tables, and dynamically displays the specific source files the AI referenced to generate its answer.
- **Secure Authentication**: JWT-based authentication flow with HTTP-only cookies and protected routing.

## Tech Stack

- **Framework**: React.js (via Vite)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Cryptography**: CryptoJS (AES-256)
- **Markdown Processing**: React-Markdown, Remark-GFM
- *Routing**: React Router DOM
- **HTTP Client**: Axios (with custom encryption interceptors)

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
