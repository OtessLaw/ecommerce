import React from 'react';
import { Link } from 'react-router-dom';
import {
  FiGrid,
  FiBox,
  FiFolder,
  FiTag,
  FiImage,
  FiShoppingBag,
  FiUsers,
  FiSettings,
  FiExternalLink,
  FiLogOut,
  FiShield,
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

export default function AdminSidebar({ activeTab, setActiveTab, counts = {} }) {
  const { user, logout } = useAuth();

  const menuItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: FiGrid },
    { id: 'products', label: 'Products Catalog', icon: FiBox, count: counts.products },
    { id: 'categories', label: 'Category Manager', icon: FiFolder },
    { id: 'coupons', label: 'Coupons & Discounts', icon: FiTag },
    { id: 'banners', label: 'Banners & Sliders', icon: FiImage },
    { id: 'orders', label: 'Orders & Fulfillment', icon: FiShoppingBag, count: counts.orders, badgeColor: 'bg-[#D4AF37] text-black' },
    { id: 'users', label: 'Users & Staff Roles', icon: FiUsers, count: counts.users },
    { id: 'settings', label: 'Store Settings', icon: FiSettings },
  ];

  return (
    <aside className="w-full lg:w-64 bg-[#141414] border-r border-[#2A2A2A] flex flex-col justify-between shrink-0 min-h-[85vh] rounded-2xl p-4">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center space-x-3 px-3 py-2 border-b border-[#2A2A2A]">
          <div className="p-2 bg-[#D4AF37]/20 text-[#D4AF37] rounded-xl border border-[#D4AF37]/30">
            <FiShield size={20} />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-white tracking-wider">J&J VINTAGE</h2>
            <span className="text-[10px] font-bold uppercase text-[#D4AF37]">ADMIN CONTROL</span>
          </div>
        </div>

        {/* Sidebar Nav Items */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-[#D4AF37] text-black font-extrabold shadow-gold'
                    : 'text-gray-300 hover:bg-[#1F1F1F] hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon size={16} />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && item.count !== null && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      isActive ? 'bg-black text-[#D4AF37]' : item.badgeColor || 'bg-[#2A2A2A] text-gray-300'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Navigation Actions */}
      <div className="space-y-2 pt-6 border-t border-[#2A2A2A] text-xs">
        <Link
          to="/"
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#1A1A1A] hover:bg-[#2A2A2A] text-gray-300 transition"
        >
          <span className="font-semibold">View Live Storefront</span>
          <FiExternalLink size={14} />
        </Link>

        <button
          onClick={logout}
          className="w-full flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition text-xs font-semibold"
        >
          <FiLogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
