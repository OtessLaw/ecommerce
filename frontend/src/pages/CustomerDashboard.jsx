import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/product/ProductCard';
import API from '../services/api';
import { FiPackage, FiHeart, FiMapPin, FiUser, FiClock, FiPrinter, FiCheckCircle } from 'react-icons/fi';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const { wishlist } = useWishlist();
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      let orderList = [];
      try {
        const { data } = await API.get('/orders/myorders');
        if (Array.isArray(data) && data.length > 0) orderList = data;
      } catch (e) {}

      // Fallback for guest checkout orders
      const localGuest = JSON.parse(localStorage.getItem('luxury_guest_orders') || '[]');
      if (Array.isArray(localGuest) && localGuest.length > 0) {
        const existingIds = new Set(orderList.map((o) => o._id));
        localGuest.forEach((g) => {
          if (!existingIds.has(g._id)) orderList.push(g);
        });
      }

      setOrders(orderList);
    } catch (err) {
      console.error('Error loading my orders', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* User Header */}
      <div className="bg-[#141414] p-6 rounded-3xl border border-[#2A2A2A] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#D4AF37] to-[#9E7B3B] text-black font-extrabold text-2xl flex items-center justify-center">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <span className="text-xs text-[#D4AF37] font-bold uppercase tracking-widest">ATELIER CLIENT MEMBER</span>
            <h1 className="text-2xl font-extrabold text-white">{user?.name || 'Valued Client'}</h1>
            <p className="text-xs text-gray-400">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b border-[#2A2A2A] text-xs font-bold uppercase">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'orders' ? 'border-[#D4AF37] text-[#D4AF37]' : 'border-transparent text-gray-400'
          }`}
        >
          <FiPackage size={16} />
          <span>MY ORDERS ({orders.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('wishlist')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'wishlist' ? 'border-[#D4AF37] text-[#D4AF37]' : 'border-transparent text-gray-400'
          }`}
        >
          <FiHeart size={16} />
          <span>SAVED WISHLIST ({wishlist.length})</span>
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="bg-[#141414] p-12 rounded-2xl border border-[#2A2A2A] text-center space-y-3">
                <FiPackage size={36} className="mx-auto text-gray-600" />
                <p className="text-sm text-gray-400">You haven't placed any atelier orders yet.</p>
              </div>
            ) : (
              orders.map((ord) => (
                <div key={ord._id} className="bg-[#141414] p-6 rounded-2xl border border-[#2A2A2A] space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between border-b border-[#2A2A2A] pb-3 text-xs gap-2">
                    <div>
                      <span className="text-gray-400">Invoice Ref: </span>
                      <span className="font-mono font-bold text-white">{ord.invoiceNumber}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Status: </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#D4AF37]/20 text-[#D4AF37]">
                        {ord.orderStatus || 'Pending'}
                      </span>
                    </div>
                  </div>

                  {/* Status Progress Bar */}
                  <div className="grid grid-cols-4 gap-2 pt-2 text-[10px] text-center uppercase font-bold text-gray-500">
                    <div className={ord.orderStatus ? 'text-[#D4AF37]' : ''}>1. Received</div>
                    <div className={['Processing', 'Shipped', 'Delivered'].includes(ord.orderStatus) ? 'text-[#D4AF37]' : ''}>2. Processing</div>
                    <div className={['Shipped', 'Delivered'].includes(ord.orderStatus) ? 'text-[#D4AF37]' : ''}>3. Shipped</div>
                    <div className={ord.orderStatus === 'Delivered' ? 'text-emerald-400' : ''}>4. Delivered</div>
                  </div>

                  {/* Items */}
                  <div className="space-y-2 pt-2">
                    {ord.orderItems?.map((it, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <div className="flex items-center space-x-3">
                          <img src={it.image} alt={it.title} className="w-10 h-12 object-cover rounded-lg border border-[#2A2A2A]" />
                          <div>
                            <p className="font-semibold text-white">{it.title}</p>
                            <p className="text-[10px] text-gray-400">Qty: {it.quantity} | {it.selectedSize}</p>
                          </div>
                        </div>
                        <span className="font-bold text-[#D4AF37]">GH₵ {(it.price * it.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-[#2A2A2A] text-xs">
                    <span className="text-gray-400">Total: <strong className="text-white">GH₵ {ord.totalPrice?.toLocaleString()}</strong></span>
                    <button onClick={() => window.print()} className="text-[#D4AF37] font-bold flex items-center space-x-1 hover:underline">
                      <FiPrinter size={14} />
                      <span>INVOICE</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'wishlist' && (
          <div>
            {wishlist.length === 0 ? (
              <p className="text-xs text-gray-400">No saved items in your wishlist.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlist.map((item) => (
                  <ProductCard key={item._id} product={item} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
