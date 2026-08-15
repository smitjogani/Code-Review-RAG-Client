import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (!isLogin && formData.name.trim().length < 2) {
      toast.error('Name must be at least 2 characters long');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : { name: formData.name, email: formData.email, password: formData.password };
      
      const response = await api.post(endpoint, payload);
      
      if (response.data.success) {
        toast.success(isLogin ? 'Welcome back!' : 'Account created successfully!');
        // Store basic user info if needed, token is in HTTP-only cookie
        localStorage.setItem('user', JSON.stringify(response.data.data));
        navigate('/chat', { state: { showUploadModal: true } });
      }
    } catch (error) {
      // Error is handled by api interceptor which shows toast
      console.error('Auth error', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-obsidian flex items-center justify-center p-4 relative overflow-hidden">
      <div className="w-full max-w-md z-10">
        {/* Brand Logo */}
        <div className="flex flex-col items-center mb-10">
          <img src="/favicon.svg" alt="ORIVA Logo" className="mb-4 w-12 h-12 grayscale brightness-0 opacity-80" />
          <h1 className="text-3xl font-display font-bold tracking-widest text-obsidian">
            ORIVA
          </h1>
        </div>

        {/* Auth Card */}
        <div className="bg-white/80 backdrop-blur-xl border border-border rounded-2xl p-8 shadow-2xl transition-all duration-300">
          <h2 className="text-2xl font-semibold mb-6 text-center text-obsidian">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field - Only for Register */}
            <div className={`space-y-1 overflow-hidden transition-all duration-300 ${isLogin ? 'h-0 opacity-0' : 'h-20 opacity-100'}`}>
              <label className="text-sm font-medium text-subtle ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full bg-zinc-50 border border-border rounded-xl py-3 pl-10 pr-4 text-obsidian focus:outline-none focus:border-obsidian/40 focus:ring-1 focus:ring-obsidian/10 transition-all placeholder:text-zinc-400"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-subtle ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className="w-full bg-zinc-50 border border-border rounded-xl py-3 pl-10 pr-4 text-obsidian focus:outline-none focus:border-obsidian/40 focus:ring-1 focus:ring-obsidian/10 transition-all placeholder:text-zinc-400"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-subtle ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-zinc-50 border border-border rounded-xl py-3 pl-10 pr-4 text-obsidian focus:outline-none focus:border-obsidian/40 focus:ring-1 focus:ring-obsidian/10 transition-all placeholder:text-zinc-400"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-obsidian hover:bg-zinc-800 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-4 shadow-lg shadow-obsidian/10"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            
            <button
              type="button"
              onClick={() => {
                localStorage.setItem('user', JSON.stringify({ name: 'Demo User', email: 'demo@example.com', role: 'user' }));
                navigate('/chat?demo=true');
              }}
              className="w-full bg-zinc-100 hover:bg-zinc-200 text-obsidian font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] mt-2"
            >
              Skip Login (Try Demo Mode)
            </button>
          </form>

          {/* Toggle */}
          <div className="mt-6 text-center text-sm text-subtle">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setFormData({ name: '', email: '', password: '' });
              }}
              className="text-obsidian hover:text-zinc-700 underline font-medium transition-colors ml-1"
            >
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
