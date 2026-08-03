import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiLock, FiMail } from 'react-icons/fi';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(email, password);
      if (user?.role === 'admin' || user?.role === 'staff') {
        navigate('/admin/dashboard');
      } else {
        navigate('/customer/dashboard');
      }
    } catch (err) {}
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-[#141414] p-8 rounded-3xl border border-[#2A2A2A] shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs text-[#D4AF37] font-bold uppercase tracking-widest">J&J VINTAGE MEMBER PORTAL</span>
          <h1 className="text-2xl font-extrabold text-white uppercase">SIGN IN TO ACCOUNT</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="user@luxury.com"
                className="w-full bg-[#1A1A1A] text-white text-xs rounded-xl pl-9 pr-3 py-3 border border-[#2A2A2A] focus:border-[#D4AF37]"
              />
              <FiMail className="absolute left-3 top-3.5 text-gray-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-[#1A1A1A] text-white text-xs rounded-xl pl-9 pr-3 py-3 border border-[#2A2A2A] focus:border-[#D4AF37]"
              />
              <FiLock className="absolute left-3 top-3.5 text-gray-500" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full gold-btn py-3.5 rounded-xl text-xs font-extrabold uppercase tracking-widest"
          >
            {loading ? 'AUTHENTICATING...' : 'SIGN IN'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-[#D4AF37] font-bold hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
