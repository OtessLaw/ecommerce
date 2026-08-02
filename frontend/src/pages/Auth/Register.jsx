import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiUser, FiMail, FiLock, FiPhone } from 'react-icons/fi';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'customer',
  });

  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(formData.name, formData.email, formData.password, formData.phone, formData.role);
      navigate('/customer/dashboard');
    } catch (err) {}
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-[#141414] p-8 rounded-3xl border border-[#2A2A2A] shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs text-[#D4AF37] font-bold uppercase tracking-widest">JOIN PRIVATE CLUB</span>
          <h1 className="text-2xl font-extrabold text-white uppercase">CREATE AN ACCOUNT</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Full Name</label>
            <div className="relative">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Lady Genevieve Sterling"
                className="w-full bg-[#1A1A1A] text-white text-xs rounded-xl pl-9 pr-3 py-3 border border-[#2A2A2A] focus:border-[#D4AF37]"
              />
              <FiUser className="absolute left-3 top-3.5 text-gray-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="genevieve@sterling.com"
                className="w-full bg-[#1A1A1A] text-white text-xs rounded-xl pl-9 pr-3 py-3 border border-[#2A2A2A] focus:border-[#D4AF37]"
              />
              <FiMail className="absolute left-3 top-3.5 text-gray-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Phone Number (For SMS Alerts)</label>
            <div className="relative">
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="+234 809 876 5432"
                className="w-full bg-[#1A1A1A] text-white text-xs rounded-xl pl-9 pr-3 py-3 border border-[#2A2A2A] focus:border-[#D4AF37]"
              />
              <FiPhone className="absolute left-3 top-3.5 text-gray-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
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
            {loading ? 'CREATING ACCOUNT...' : 'REGISTER ACCOUNT'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400">
          Already a member?{' '}
          <Link to="/login" className="text-[#D4AF37] font-bold hover:underline">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}
