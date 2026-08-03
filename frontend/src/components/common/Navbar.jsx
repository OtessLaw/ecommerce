import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { FiSearch, FiShoppingBag, FiHeart, FiUser, FiMenu, FiX, FiShield, FiLogOut, FiTruck } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

const categories = [
  'Men',
  'Women',
  'Kids',
  'Shoes',
  'Sneakers',
  'Bags',
  'Accessories',
  'Jewelry',
  'Beauty',
  'New Arrivals',
  'Luxury',
  'Sale',
];

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { itemCount, setIsCartOpen } = useCart();
  const { wishlist } = useWishlist();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0B0B0B]/90 backdrop-blur-md border-b border-[#2A2A2A]">
      {/* Top Banner Notice (Animated Marquee) */}
      <div className="bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#9E7B3B] text-black text-xs font-extrabold py-1.5 px-4 overflow-hidden whitespace-nowrap shadow-md">
        <div className="animate-marquee tracking-wider font-extrabold uppercase">
          🛍️ Discover the latest fashion collections at JNJ Vintage. Shop with confidence. &nbsp;&nbsp; • &nbsp;&nbsp; 🛍️ Discover the latest fashion collections at JNJ Vintage. Shop with confidence.
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Mobile Menu Icon */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-gray-300 hover:text-white p-2"
          >
            {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>

          {/* Logo */}
          <RouterLink to="/" className="flex items-center space-x-2">
            <span className="font-display font-extrabold text-2xl tracking-widest text-white">
              J&J <span className="gold-gradient-text">VINTAGE</span>
            </span>
          </RouterLink>

          {/* Desktop Categories Dropdown / Links */}
          <nav className="hidden lg:flex items-center space-x-6 text-sm font-medium">
            {categories.slice(0, 7).map((cat) => (
              <RouterLink
                key={cat}
                to={`/shop?category=${encodeURIComponent(cat)}`}
                className="text-gray-300 hover:text-[#D4AF37] transition-colors duration-200 uppercase tracking-widest text-xs"
              >
                {cat}
              </RouterLink>
            ))}
            <RouterLink
              to="/shop?isFlashSale=true"
              className="text-[#D4AF37] font-bold uppercase tracking-widest text-xs animate-pulse"
            >
              SALE 🔥
            </RouterLink>

            <RouterLink
              to="/track-order"
              className="text-xs font-extrabold text-[#D4AF37] hover:underline transition uppercase tracking-widest flex items-center space-x-1 border-l border-[#2A2A2A] pl-4"
            >
              <FiTruck size={14} />
              <span>TRACK ORDER</span>
            </RouterLink>
          </nav>

          {/* Right Actions: Search, Wishlist, Cart, Profile */}
          <div className="flex items-center space-x-5">
            {/* Search input */}
            <form onSubmit={handleSearchSubmit} className="hidden sm:flex items-center relative">
              <input
                type="text"
                placeholder="Search luxury couture..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#1A1A1A] text-white text-xs rounded-full pl-9 pr-4 py-2 border border-[#2A2A2A] focus:outline-none focus:border-[#D4AF37] w-48 transition-all duration-300 focus:w-64"
              />
              <FiSearch className="absolute left-3 text-gray-400 text-sm" />
            </form>

            {/* Wishlist */}
            <RouterLink to="/customer/wishlist" className="relative p-2 text-gray-300 hover:text-[#D4AF37] transition">
              <FiHeart size={20} />
              {wishlist.length > 0 && (
                <span className="absolute top-0 right-0 bg-[#D4AF37] text-black font-extrabold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </RouterLink>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-gray-300 hover:text-[#D4AF37] transition"
            >
              <FiShoppingBag size={20} />
              {itemCount > 0 && (
                <span className="absolute top-0 right-0 bg-[#D4AF37] text-black font-extrabold text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                  {itemCount}
                </span>
              )}
            </button>

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center space-x-1 p-2 text-gray-300 hover:text-[#D4AF37] transition focus:outline-none"
              >
                <FiUser size={20} />
              </button>

              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-3 w-56 bg-[#141414] border border-[#2A2A2A] rounded-xl shadow-2xl py-2 z-50 divide-y divide-[#2A2A2A]"
                  onMouseLeave={() => setUserDropdownOpen(false)}
                >
                  {user ? (
                    <>
                      <div className="px-4 py-3">
                        <p className="text-xs text-gray-400">Signed in as</p>
                        <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded bg-[#D4AF37]/20 text-[#D4AF37] uppercase">
                          {user.role}
                        </span>
                      </div>
                      <div className="py-1">
                        <RouterLink
                          to="/track-order"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center space-x-2 px-4 py-2 text-xs text-[#D4AF37] font-extrabold hover:bg-[#2A2A2A]"
                        >
                          <FiTruck size={14} />
                          <span>Track Order Status</span>
                        </RouterLink>
                        <RouterLink
                          to="/customer/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="block px-4 py-2 text-xs text-gray-300 hover:bg-[#2A2A2A] hover:text-[#D4AF37]"
                        >
                          Customer Dashboard
                        </RouterLink>
                        {isAdmin && (
                          <RouterLink
                            to="/admin/dashboard"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center space-x-2 px-4 py-2 text-xs text-[#D4AF37] font-semibold hover:bg-[#2A2A2A]"
                          >
                            <FiShield size={14} />
                            <span>Admin Portal</span>
                          </RouterLink>
                        )}
                      </div>
                      <div className="py-1">
                        <button
                          onClick={() => {
                            logout();
                            setUserDropdownOpen(false);
                          }}
                          className="flex items-center space-x-2 w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-[#2A2A2A]"
                        >
                          <FiLogOut size={14} />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="p-3 space-y-2">
                      <RouterLink
                        to="/track-order"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center justify-center space-x-2 py-2 px-4 rounded-lg bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] font-bold text-xs hover:bg-[#D4AF37]/30 transition"
                      >
                        <FiTruck size={14} />
                        <span>Track Order Status</span>
                      </RouterLink>
                      <RouterLink
                        to="/login"
                        onClick={() => setUserDropdownOpen(false)}
                        className="block text-center py-2 px-4 rounded-lg bg-[#D4AF37] text-black font-bold text-xs hover:bg-[#FFF0B9] transition"
                      >
                        Sign In
                      </RouterLink>
                      <RouterLink
                        to="/register"
                        onClick={() => setUserDropdownOpen(false)}
                        className="block text-center py-2 px-4 rounded-lg bg-[#1A1A1A] border border-[#2A2A2A] text-white text-xs hover:bg-[#2A2A2A] transition"
                      >
                        Create Account
                      </RouterLink>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#141414] border-t border-[#2A2A2A] px-4 pt-4 pb-6 space-y-4">
          <RouterLink
            to="/track-order"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-center space-x-2 w-full py-3 rounded-xl bg-[#D4AF37] text-black font-extrabold text-xs uppercase tracking-wider shadow-gold"
          >
            <FiTruck size={16} />
            <span>TRACK ORDER LOGISTICS</span>
          </RouterLink>

          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1A1A1A] text-white text-sm rounded-lg pl-9 pr-4 py-2.5 border border-[#2A2A2A]"
            />
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
          </form>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((cat) => (
              <RouterLink
                key={cat}
                to={`/shop?category=${encodeURIComponent(cat)}`}
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-300 hover:text-[#D4AF37] text-xs font-semibold py-2 px-3 rounded-lg bg-[#1A1A1A] uppercase tracking-wider"
              >
                {cat}
              </RouterLink>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
