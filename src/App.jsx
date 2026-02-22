import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LandingPage from './pages/LandingPage';
import ChatPage from './pages/ChatPage';
import StatusPage from './pages/StatusPage';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" toastOptions={{
        className: 'font-mono text-sm',
        style: {
          border: '1px solid #E5E5E5',
          background: '#FAFAFA',
          color: '#111111',
        },
      }} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/status" element={<StatusPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
