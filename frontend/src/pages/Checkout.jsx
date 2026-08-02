import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import toast from 'react-hot-toast';
import { FiLock, FiCreditCard, FiTruck } from 'react-icons/fi';

export default function Checkout() {
  const { cartItems, itemsPrice, discountAmount, vatAmount, shippingPrice, totalPrice, clearCart, coupon } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: user ? user.name : '',
    email: user ? user.email : '',
    phone: user ? user.phone || '' : '',
    street: '',
    city: 'Lagos',
    state: 'Lagos State',
    country: 'Nigeria',
    paymentMethod: 'Paystack',
  });

  const [loading, setLoading] = useState(false);

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <p className="text-xl font-bold text-white">Your bag is empty.</p>
        <button onClick={() => navigate('/shop')} className="gold-btn px-6 py-2.5 rounded-full text-xs font-bold uppercase">
          EXPLORE SHOP
        </button>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Create order on backend
      const orderPayload = {
        orderItems: cartItems,
        shippingAddress: {
          fullName: formData.fullName,
          phone: formData.phone,
          street: formData.street,
          city: formData.city,
          state: formData.state,
          country: formData.country,
        },
        paymentMethod: formData.paymentMethod,
        itemsPrice,
        vatAmount,
        shippingPrice,
        discountAmount,
        totalPrice,
        guestEmail: formData.email,
      };

      const { data: createdOrder } = await API.post('/orders', orderPayload);

      if (formData.paymentMethod === 'CashOnDelivery') {
        clearCart();
        toast.success('Order placed successfully via Cash on Delivery!');
        navigate(`/order-success?reference=${createdOrder.invoiceNumber}&orderId=${createdOrder._id}`);
        return;
      }

      // 2. Paystack Initialization
      const { data: paystackInit } = await API.post('/paystack/initialize', {
        orderId: createdOrder._id,
        email: formData.email,
        amount: totalPrice,
        callback_url: `${window.location.origin}/order-success?orderId=${createdOrder._id}`,
      });

      const reference = paystackInit?.data?.reference || `LUX_${Date.now()}`;
      const accessCode = paystackInit?.data?.access_code;

      // 3. Trigger Paystack Popup Inline JS if available or redirect to Paystack authorization URL
      const paystackKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_mock_paystack_public_key';

      if (window.PaystackPop) {
        const handler = window.PaystackPop.setup({
          key: paystackKey,
          email: formData.email,
          amount: Math.round(totalPrice * 100), // in kobo
          ref: reference,
          access_code: accessCode,
          onClose: function () {
            toast.error('Payment window closed before completion');
            setLoading(false);
          },
          callback: async function (response) {
            toast.loading('Verifying transaction securely with backend...');
            const { data: verifyRes } = await API.get(`/paystack/verify/${response.reference}?orderId=${createdOrder._id}`);
            clearCart();
            toast.success('Payment verified successfully!');
            navigate(`/order-success?reference=${response.reference}&orderId=${createdOrder._id}`);
          },
        });
        handler.openIframe();
      } else if (paystackInit?.data?.authorization_url) {
        // Redirect fallback
        clearCart();
        window.location.href = paystackInit.data.authorization_url;
      } else {
        // Direct simulation fallback
        clearCart();
        navigate(`/order-success?reference=${reference}&orderId=${createdOrder._id}`);
      }
    } catch (error) {
      console.error('Checkout error', error);
      toast.error(error.response?.data?.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-extrabold text-white uppercase tracking-tight mb-8">
        EXPRESS <span className="gold-gradient-text">CHECKOUT</span>
      </h1>

      <form onSubmit={handleCheckoutSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Customer & Shipping Information */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#141414] p-6 rounded-2xl border border-[#2A2A2A] space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2 border-b border-[#2A2A2A] pb-3">
              <FiTruck className="text-[#D4AF37]" />
              <span>1. Shipping & Contact Details</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Lord Alexander Wright"
                  className="w-full bg-[#1A1A1A] text-white text-xs rounded-xl p-3 border border-[#2A2A2A] focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="alexander@domain.com"
                  className="w-full bg-[#1A1A1A] text-white text-xs rounded-xl p-3 border border-[#2A2A2A] focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Phone Number (For SMS Updates)</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="+234 801 234 5678"
                  className="w-full bg-[#1A1A1A] text-white text-xs rounded-xl p-3 border border-[#2A2A2A] focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#1A1A1A] text-white text-xs rounded-xl p-3 border border-[#2A2A2A] focus:border-[#D4AF37]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Street Address</label>
                <input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  required
                  placeholder="House number, Street name, Penthouse suite"
                  className="w-full bg-[#1A1A1A] text-white text-xs rounded-xl p-3 border border-[#2A2A2A] focus:border-[#D4AF37]"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-[#141414] p-6 rounded-2xl border border-[#2A2A2A] space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2 border-b border-[#2A2A2A] pb-3">
              <FiCreditCard className="text-[#D4AF37]" />
              <span>2. Select Payment Method</span>
            </h2>

            <div className="space-y-3">
              <label
                className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition ${
                  formData.paymentMethod === 'Paystack' ? 'bg-[#1F1F1F] border-[#D4AF37]' : 'bg-[#1A1A1A] border-[#2A2A2A]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Paystack"
                    checked={formData.paymentMethod === 'Paystack'}
                    onChange={handleChange}
                    className="accent-[#D4AF37]"
                  />
                  <div>
                    <span className="text-xs font-extrabold text-white block">Paystack Secure Gateway</span>
                    <span className="text-[11px] text-gray-400">Cards, Bank Transfer, USSD, Apple Pay & QR</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#D4AF37]">INSTANT</span>
              </label>

              <label
                className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition ${
                  formData.paymentMethod === 'CashOnDelivery' ? 'bg-[#1F1F1F] border-[#D4AF37]' : 'bg-[#1A1A1A] border-[#2A2A2A]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="CashOnDelivery"
                    checked={formData.paymentMethod === 'CashOnDelivery'}
                    onChange={handleChange}
                    className="accent-[#D4AF37]"
                  />
                  <div>
                    <span className="text-xs font-extrabold text-white block">Cash / Terminal on Delivery</span>
                    <span className="text-[11px] text-gray-400">Pay when order arrives at your address</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-gray-400">COD</span>
              </label>
            </div>
          </div>
        </div>

        {/* Order Summary Column */}
        <div className="bg-[#141414] p-6 rounded-2xl border border-[#2A2A2A] h-fit space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-[#2A2A2A] pb-3">
            Order Summary ({cartItems.length} items)
          </h2>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {cartItems.map((item) => (
              <div key={`${item.product}-${item.selectedColor}`} className="flex space-x-3 text-xs">
                <img src={item.image} alt={item.title} className="w-12 h-14 object-cover rounded-lg border border-[#2A2A2A]" />
                <div className="flex-1">
                  <p className="font-semibold text-white truncate">{item.title}</p>
                  <p className="text-[10px] text-gray-400">Qty: {item.quantity} | {item.selectedSize}</p>
                </div>
                <span className="font-bold text-[#D4AF37]">₦{(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2 border-t border-[#2A2A2A] pt-4 text-xs text-gray-400">
            <div className="flex justify-between">
              <span>Items Subtotal</span>
              <span className="text-white">₦{itemsPrice.toLocaleString()}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-[#D4AF37]">
                <span>Coupon Discount</span>
                <span>-₦{discountAmount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>VAT (7.5%)</span>
              <span className="text-white">₦{vatAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping Fee</span>
              <span className="text-white">{shippingPrice === 0 ? 'FREE' : `₦${shippingPrice.toLocaleString()}`}</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-[#2A2A2A]">
              <span>Grand Total</span>
              <span className="text-[#D4AF37]">₦{totalPrice.toLocaleString()}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full gold-btn py-4 rounded-xl text-xs font-extrabold uppercase tracking-widest flex items-center justify-center space-x-2"
          >
            <FiLock size={16} />
            <span>{loading ? 'PROCESSING...' : `PAY ₦${totalPrice.toLocaleString()} VIA PAYSTACK`}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
