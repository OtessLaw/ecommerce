import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FiSearch, FiPackage, FiTruck, FiCheckCircle, FiClock, FiMapPin, FiPhone, FiAlertCircle } from 'react-icons/fi';
import { useCurrency } from '../context/CurrencyContext';
import API from '../services/api';

export default function TrackOrder() {
  const { formatPrice } = useCurrency();
  const [searchParams] = useSearchParams();
  const initialInvoice = searchParams.get('invoice') || searchParams.get('orderId') || '';

  const [inputQuery, setInputQuery] = useState(initialInvoice);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialInvoice) {
      handleTrack(initialInvoice);
    }
  }, [initialInvoice]);

  const handleTrack = async (queryToSearch) => {
    const q = queryToSearch || inputQuery;
    if (!q.trim()) return;

    setLoading(true);
    setSearched(true);
    setErrorMsg('');
    setOrder(null);

    try {
      // 1. Search by Order ID or Invoice Number
      const { data } = await API.get(`/orders/${q.trim()}`);
      if (data && (data._id || data.invoiceNumber)) {
        setOrder(data);
        return;
      }
    } catch (err) {
      // 2. Fallback: Search all orders for phone or invoice match
      try {
        const { data: allOrders } = await API.get('/orders');
        const match = (allOrders || []).find(
          (o) =>
            o.invoiceNumber?.toLowerCase() === q.trim().toLowerCase() ||
            o._id === q.trim() ||
            o.shippingAddress?.phone?.replace(/[^0-9]/g, '').includes(q.trim().replace(/[^0-9]/g, ''))
        );
        if (match) {
          setOrder(match);
          return;
        }
      } catch (e) {}

      setErrorMsg('No order found matching this Order Number or Phone. Please verify your invoice number.');
    } finally {
      setLoading(false);
    }
  };

  const getStepStatus = (statusName) => {
    if (!order) return 'pending';
    const current = (order.orderStatus || 'Pending').toLowerCase();
    
    const stepsOrder = ['pending', 'processing', 'shipped', 'delivered'];
    const currentIndex = stepsOrder.indexOf(current);
    const stepIndex = stepsOrder.indexOf(statusName);

    if (current === 'cancelled') return 'cancelled';
    if (currentIndex >= stepIndex && currentIndex !== -1) return 'completed';
    if (currentIndex + 1 === stepIndex) return 'current';
    return 'pending';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-xs text-[#D4AF37] font-bold uppercase tracking-widest">REAL-TIME LOGISTICS TRACKER</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white uppercase tracking-tight">
          TRACK YOUR <span className="gold-gradient-text">J&J VINTAGE ORDER</span>
        </h1>
        <p className="text-xs text-gray-400 max-w-md mx-auto">
          Enter your Invoice / Order ID (e.g., INV-20260802-94821) or your phone number below to check live delivery progress.
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl p-4 sm:p-6 shadow-2xl max-w-xl mx-auto">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleTrack();
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Enter Invoice # or Phone Number..."
              className="w-full bg-[#1A1A1A] text-white text-xs sm:text-sm rounded-xl pl-10 pr-4 py-3 border border-[#2A2A2A] focus:border-[#D4AF37] font-mono"
            />
            <FiSearch className="absolute left-3.5 top-3.5 text-gray-500" size={16} />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="gold-btn px-6 py-3 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-center space-x-2"
          >
            <span>{loading ? 'SEARCHING...' : 'TRACK ORDER'}</span>
          </button>
        </form>
      </div>

      {/* Error Message */}
      {searched && errorMsg && !order && !loading && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center space-y-2 max-w-lg mx-auto">
          <FiAlertCircle className="mx-auto text-red-400" size={32} />
          <p className="text-xs text-red-300 font-semibold">{errorMsg}</p>
          <p className="text-[11px] text-gray-400">
            Check your SMS order receipt or visit your{' '}
            <Link to="/customer/dashboard" className="text-[#D4AF37] underline">
              Customer Dashboard
            </Link>.
          </p>
        </div>
      )}

      {/* Live Tracking Result */}
      {order && (
        <div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl p-6 sm:p-8 space-y-8 shadow-2xl">
          {/* Order Header Summary */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#2A2A2A] pb-6 gap-4">
            <div>
              <span className="text-[10px] text-gray-400 uppercase font-mono">Invoice Number</span>
              <h2 className="text-xl font-extrabold text-white font-mono">{order.invoiceNumber}</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Placed on: {new Date(order.createdAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10px] text-gray-400 uppercase">Current Status</span>
              <div className="mt-1">
                <span className="px-3 py-1.5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] text-xs font-extrabold uppercase border border-[#D4AF37]/30">
                  {order.orderStatus || 'Pending'}
                </span>
              </div>
            </div>
          </div>

          {/* Timeline Tracker Steps */}
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold text-gray-300 uppercase tracking-wider">Fulfillment Timeline</h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {/* Step 1: Order Received */}
              <div className={`p-4 rounded-xl border space-y-2 ${
                getStepStatus('pending') === 'completed' ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' : 'bg-[#1A1A1A] border-[#2A2A2A] text-gray-500'
              }`}>
                <div className="flex items-center space-x-2">
                  <FiCheckCircle size={18} />
                  <span className="text-xs font-bold uppercase">1. Order Received</span>
                </div>
                <p className="text-[10px] text-gray-400">Order recorded in atelier system.</p>
              </div>

              {/* Step 2: Processing */}
              <div className={`p-4 rounded-xl border space-y-2 ${
                getStepStatus('processing') === 'completed' ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' : 'bg-[#1A1A1A] border-[#2A2A2A] text-gray-500'
              }`}>
                <div className="flex items-center space-x-2">
                  <FiPackage size={18} />
                  <span className="text-xs font-bold uppercase">2. Processing</span>
                </div>
                <p className="text-[10px] text-gray-400">Luxury items packaged for dispatch.</p>
              </div>

              {/* Step 3: Shipped / Dispatched */}
              <div className={`p-4 rounded-xl border space-y-2 ${
                getStepStatus('shipped') === 'completed' ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' : 'bg-[#1A1A1A] border-[#2A2A2A] text-gray-500'
              }`}>
                <div className="flex items-center space-x-2">
                  <FiTruck size={18} />
                  <span className="text-xs font-bold uppercase">3. Dispatched</span>
                </div>
                <p className="text-[10px] text-gray-400">En route with courier partner.</p>
              </div>

              {/* Step 4: Delivered */}
              <div className={`p-4 rounded-xl border space-y-2 ${
                getStepStatus('delivered') === 'completed' ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' : 'bg-[#1A1A1A] border-[#2A2A2A] text-gray-500'
              }`}>
                <div className="flex items-center space-x-2">
                  <FiCheckCircle size={18} />
                  <span className="text-xs font-bold uppercase">4. Delivered</span>
                </div>
                <p className="text-[10px] text-gray-400">Package safely delivered.</p>
              </div>
            </div>
          </div>

          {/* Customer & Address Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-[#1A1A1A] p-6 rounded-xl border border-[#2A2A2A] text-xs">
            <div className="space-y-2">
              <span className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-wider block border-b border-[#2A2A2A] pb-1">
                DELIVERY INFORMATION
              </span>
              <div className="flex items-start space-x-2 text-gray-300">
                <FiMapPin className="text-gray-500 mt-0.5" size={14} />
                <div>
                  <strong className="text-white block">{order.shippingAddress?.fullName}</strong>
                  <p>{order.shippingAddress?.street}</p>
                  <p>{order.shippingAddress?.city}, {order.shippingAddress?.state}, {order.shippingAddress?.country || 'Ghana'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-wider block border-b border-[#2A2A2A] pb-1">
                CONTACT & PAYMENT
              </span>
              <div className="space-y-1.5 text-gray-300">
                <div className="flex items-center space-x-2">
                  <FiPhone className="text-gray-500" size={14} />
                  <span className="font-mono text-white">{order.shippingAddress?.phone}</span>
                </div>
                <p>Payment Method: <strong className="text-white uppercase">{order.paymentMethod}</strong></p>
                <p>Total Paid: <strong className="text-[#D4AF37]">{formatPrice(order.totalPrice)}</strong></p>
              </div>
            </div>
          </div>

          {/* Ordered Items List */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold text-gray-300 uppercase tracking-wider">Ordered Items</h3>
            <div className="divide-y divide-[#1F1F1F] bg-[#1A1A1A] rounded-xl p-4 border border-[#2A2A2A]">
              {order.orderItems?.map((it, idx) => (
                <div key={idx} className="flex justify-between items-center py-2 text-xs">
                  <div className="flex items-center space-x-3">
                    <img src={it.image} alt={it.title} className="w-10 h-10 object-cover rounded-lg border border-[#2A2A2A]" />
                    <div>
                      <p className="font-bold text-white">{it.title}</p>
                      <p className="text-[10px] text-gray-400">Qty: {it.quantity} | Size: {it.selectedSize}</p>
                    </div>
                  </div>
                  <span className="font-bold text-[#D4AF37]">{formatPrice(it.price * it.quantity)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
