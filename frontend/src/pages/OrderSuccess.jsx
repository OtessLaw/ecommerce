import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FiCheckCircle, FiPackage, FiPrinter, FiMessageSquare } from 'react-icons/fi';
import { useCurrency } from '../context/CurrencyContext';
import API from '../services/api';

export default function OrderSuccess() {
  const { formatPrice } = useCurrency();
  const [searchParams] = useSearchParams();
  const reference = searchParams.get('reference');
  const orderId = searchParams.get('orderId');

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    } else {
      setLoading(false);
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const { data } = await API.get(`/orders/${orderId}`);
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-8">
      <div className="inline-flex p-4 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 mb-2">
        <FiCheckCircle size={48} />
      </div>

      <div className="space-y-2">
        <span className="text-xs text-[#D4AF37] font-bold uppercase tracking-widest">TRANSACTION CONFIRMED</span>
        <h1 className="text-3xl font-extrabold text-white uppercase tracking-tight">
          THANK YOU FOR YOUR <span className="gold-gradient-text">J&J VINTAGE ORDER</span>
        </h1>
        <p className="text-xs text-gray-400 max-w-md mx-auto">
          Your order has been recorded securely and an SMS confirmation alert has been dispatched to your mobile number.
        </p>
      </div>

      {/* Invoice Card */}
      <div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl p-6 text-left space-y-4 max-w-lg mx-auto">
        <div className="flex justify-between items-center border-b border-[#2A2A2A] pb-3 text-xs">
          <div>
            <p className="text-gray-400">Order Reference / Invoice</p>
            <p className="font-mono font-bold text-white text-sm">{order?.invoiceNumber || reference || 'INV-2026-94821'}</p>
          </div>
          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 font-bold rounded-full text-[10px] uppercase">
            {order?.isPaid ? 'PAID & VERIFIED' : 'CONFIRMED'}
          </span>
        </div>

        {order && (
          <div className="space-y-2 text-xs text-gray-300">
            <div className="flex justify-between">
              <span>Customer Name:</span>
              <span className="font-semibold text-white">{order.shippingAddress?.fullName}</span>
            </div>
            <div className="flex justify-between">
              <span>Phone (SMS):</span>
              <span className="font-semibold text-white font-mono">{order.shippingAddress?.phone}</span>
            </div>
            <div className="flex justify-between">
              <span>Email:</span>
              <span className="font-semibold text-white">{order.guestEmail || order.user?.email || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Address:</span>
              <span className="font-semibold text-white text-right max-w-[220px]">
                {order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.state}, {order.shippingAddress?.country || 'Ghana'}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-[#2A2A2A] font-bold text-white">
              <span>Total Amount:</span>
              <span className="text-[#D4AF37]">{formatPrice(order.totalPrice)}</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-center space-x-4">
        <button onClick={() => window.print()} className="bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white text-xs font-bold py-3 px-6 rounded-xl border border-[#2A2A2A] flex items-center space-x-2">
          <FiPrinter size={16} />
          <span>PRINT INVOICE</span>
        </button>

        <Link to="/customer/dashboard" className="gold-btn py-3 px-6 rounded-xl text-xs font-extrabold uppercase flex items-center space-x-2">
          <FiPackage size={16} />
          <span>TRACK IN DASHBOARD</span>
        </Link>
      </div>
    </div>
  );
}
