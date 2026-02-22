# Oravia Intelligence (Client)

This is the frontend component of **Oravia Intelligence**, an AI-powered architectural codebase analysis tool. It provides a sleek, high-contrast user interface for uploading your project source code (via ZIP or GitHub) and chatting interactively with an AI about its folder structure, components, and technical debt.

## Tech Stack
- **React** (via Vite)
- **Tailwind CSS v4** (for rapid, modern styling with dark mode)
- **React Markdown / Remark-GFM** (for rendering AI outputs and tables)
- **Lucide React** (for modern icons)

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Setup environment variables:**
   Create a `.env` file in this directory based on `.env.example` (if any), or ensure your backend URL is properly pointed to (default is usually `http://localhost:5000`).

3. **Run the development server:**
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to the local server address provided by Vite.

## Build for Production
To build the static files for production deployment:
```bash
npm run build
```
