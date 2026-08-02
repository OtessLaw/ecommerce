import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiInstagram, FiTwitter, FiFacebook, FiYoutube, FiMail, FiLock, FiTruck, FiRefreshCw } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      toast.success('Thank you for subscribing to Antigravity Atelier Private Club!');
      setEmail('');
    }
  };

  return (
    <footer className="bg-[#070707] text-gray-400 border-t border-[#1F1F1F] pt-16 pb-12 mt-20">
      {/* Brand Value Props */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 grid grid-cols-1 md:grid-cols-3 gap-8 border-b border-[#1F1F1F]">
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-full bg-[#141414] text-[#D4AF37] border border-[#2A2A2A]">
            <FiTruck size={24} />
          </div>
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase">Worldwide Express Shipping</h4>
            <p className="text-xs text-gray-500">Fast, insured delivery direct to your doorstep.</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-full bg-[#141414] text-[#D4AF37] border border-[#2A2A2A]">
            <FiLock size={24} />
          </div>
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase">Paystack Encrypted Checkout</h4>
            <p className="text-xs text-gray-500">100% secure payment gateway with SSL encryption.</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-full bg-[#141414] text-[#D4AF37] border border-[#2A2A2A]">
            <FiRefreshCw size={24} />
          </div>
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase">Complimentary 14-Day Returns</h4>
            <p className="text-xs text-gray-500">Hassle-free exchanges and money-back guarantee.</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Col 1 */}
        <div className="space-y-4">
          <span className="font-display font-extrabold text-xl tracking-widest text-white">
            J&J <span className="gold-gradient-text">VINTAGE</span>
          </span>
          <p className="text-xs leading-relaxed text-gray-500">
            A luxury fashion house crafting authentic vintage leather jackets, premium denim, silk gowns, and retro watches with uncompromised elegance.
          </p>
          <div className="flex space-x-4 text-gray-400">
            <a href="#" className="hover:text-[#D4AF37] transition"><FiInstagram size={18} /></a>
            <a href="#" className="hover:text-[#D4AF37] transition"><FiTwitter size={18} /></a>
            <a href="#" className="hover:text-[#D4AF37] transition"><FiFacebook size={18} /></a>
            <a href="#" className="hover:text-[#D4AF37] transition"><FiYoutube size={18} /></a>
          </div>
        </div>

        {/* Col 2 */}
        <div>
          <h5 className="text-white text-xs font-extrabold uppercase tracking-widest mb-4">Collections</h5>
          <ul className="space-y-2 text-xs">
            <li><Link to="/shop?category=Men" className="hover:text-[#D4AF37] transition">Men's Couture</Link></li>
            <li><Link to="/shop?category=Women" className="hover:text-[#D4AF37] transition">Women's Gowns</Link></li>
            <li><Link to="/shop?category=Sneakers" className="hover:text-[#D4AF37] transition">Luxury Footwear</Link></li>
            <li><Link to="/shop?category=Jewelry" className="hover:text-[#D4AF37] transition">Fine Jewelry & Watches</Link></li>
            <li><Link to="/shop?category=Bags" className="hover:text-[#D4AF37] transition">Leather Accessories</Link></li>
          </ul>
        </div>

        {/* Col 3 */}
        <div>
          <h5 className="text-white text-xs font-extrabold uppercase tracking-widest mb-4">Client Care</h5>
          <ul className="space-y-2 text-xs">
            <li><Link to="/customer/dashboard" className="hover:text-[#D4AF37] transition">Order Status & Tracking</Link></li>
            <li><Link to="/customer/support" className="hover:text-[#D4AF37] transition">Support Tickets</Link></li>
            <li><Link to="/shipping-policy" className="hover:text-[#D4AF37] transition">Shipping & Customs</Link></li>
            <li><Link to="/returns" className="hover:text-[#D4AF37] transition">Returns & Exchanges</Link></li>
            <li><Link to="/privacy" className="hover:text-[#D4AF37] transition">Privacy & Terms</Link></li>
          </ul>
        </div>

        {/* Col 4 */}
        <div>
          <h5 className="text-white text-xs font-extrabold uppercase tracking-widest mb-4">Private Club Newsletter</h5>
          <p className="text-xs text-gray-500 mb-3">Subscribe to receive exclusive access to private sales and limited runway releases.</p>
          <form onSubmit={handleSubscribe} className="space-y-2">
            <div className="relative">
              <input
                type="email"
                placeholder="Enter email address..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-[#141414] border border-[#2A2A2A] text-white text-xs rounded-lg pl-9 pr-3 py-2.5 focus:outline-none focus:border-[#D4AF37]"
              />
              <FiMail className="absolute left-3 top-3 text-gray-500" />
            </div>
            <button type="submit" className="w-full gold-btn py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider">
              JOIN PRIVATE LIST
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-[#1A1A1A] flex flex-col md:flex-row justify-between items-center text-xs text-gray-600">
        <p>© 2026 J&J VINTAGE INC. ALL RIGHTS RESERVED.</p>
        <p className="mt-2 md:mt-0 font-medium">POWERED BY PAYSTACK & ARKESEL SMS INTEGRATION</p>
      </div>
    </footer>
  );
}
