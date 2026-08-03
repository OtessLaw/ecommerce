import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiX, FiTrash2, FiPlus, FiMinus, FiShoppingBag, FiTag } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';

export default function CartDrawer() {
  const { formatPrice } = useCurrency();
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    itemsPrice,
    discountAmount,
    vatAmount,
    shippingPrice,
    totalPrice,
    coupon,
    applyCoupon,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const handleCouponSubmit = (e) => {
    e.preventDefault();
    if (couponInput.trim()) {
      applyCoupon(couponInput.trim());
      setCouponInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#141414] border-l border-[#2A2A2A] shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-[#2A2A2A] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FiShoppingBag className="text-[#D4AF37]" size={22} />
              <h2 className="text-lg font-bold text-white uppercase tracking-wider">Shopping Bag ({cartItems.length})</h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-gray-400 hover:text-white hover:bg-[#2A2A2A] rounded-full transition"
            >
              <FiX size={20} />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cartItems.length === 0 ? (
              <div className="text-center py-20 space-y-4">
                <FiShoppingBag size={48} className="mx-auto text-gray-600" />
                <p className="text-gray-400 text-sm">Your shopping bag is currently empty.</p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="gold-btn px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider"
                >
                  EXPLORE LUXURY STORE
                </button>
              </div>
            ) : (
              cartItems.map((item, idx) => (
                <div
                  key={`${item.product}-${item.selectedColor}-${item.selectedSize}`}
                  className="flex space-x-4 bg-[#1F1F1F] p-3 rounded-xl border border-[#2A2A2A]"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-20 h-24 object-cover rounded-lg border border-[#2A2A2A]"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="text-xs font-semibold text-white truncate max-w-[160px]">{item.title}</h4>
                        <button
                          onClick={() => removeFromCart(item.product, item.selectedColor, item.selectedSize)}
                          className="text-gray-500 hover:text-red-400 transition"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1">
                        Color: <span className="text-white">{item.selectedColor}</span> | Size:{' '}
                        <span className="text-white">{item.selectedSize}</span>
                      </p>
                    </div>

                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center space-x-2 bg-[#141414] border border-[#2A2A2A] rounded-lg px-2 py-1">
                        <button
                          onClick={() =>
                            updateQuantity(item.product, item.selectedColor, item.selectedSize, item.quantity - 1)
                          }
                          className="text-gray-400 hover:text-white"
                        >
                          <FiMinus size={12} />
                        </button>
                        <span className="text-xs font-bold text-white px-1">{item.quantity}</span>
                        <button
                          onClick={() =>
                            updateQuantity(item.product, item.selectedColor, item.selectedSize, item.quantity + 1)
                          }
                          className="text-gray-400 hover:text-white"
                        >
                          <FiPlus size={12} />
                        </button>
                      </div>
                      <span className="text-xs font-extrabold text-[#D4AF37]">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Summary & Checkout */}
          {cartItems.length > 0 && (
            <div className="p-5 border-t border-[#2A2A2A] bg-[#101010] space-y-3">
              {/* Coupon input */}
              <form onSubmit={handleCouponSubmit} className="flex space-x-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Coupon code (e.g. VINTAGE15)"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="w-full bg-[#1A1A1A] text-white text-xs rounded-lg pl-8 pr-3 py-2 border border-[#2A2A2A] uppercase"
                  />
                  <FiTag className="absolute left-2.5 top-2.5 text-gray-500" />
                </div>
                <button type="submit" className="bg-[#2A2A2A] hover:bg-[#D4AF37] hover:text-black text-white text-xs px-3 py-2 rounded-lg font-bold transition">
                  APPLY
                </button>
              </form>

              {coupon && (
                <div className="text-[11px] text-[#D4AF37] font-semibold flex justify-between">
                  <span>Coupon ({coupon.code}):</span>
                  <span>-{coupon.discountPercentage}%</span>
                </div>
              )}

              {/* Subtotals */}
              <div className="space-y-1 text-xs text-gray-400 border-t border-[#1F1F1F] pt-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-white font-medium">{formatPrice(itemsPrice)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#D4AF37]">
                    <span>Discount</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>VAT (5%)</span>
                  <span className="text-white font-medium">{formatPrice(vatAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Shipping</span>
                  <span className="text-white font-medium">
                    {shippingPrice === 0 ? <span className="text-[#D4AF37] font-bold">FREE</span> : formatPrice(shippingPrice)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-[#2A2A2A]">
                  <span>Total</span>
                  <span className="text-[#D4AF37]">{formatPrice(totalPrice)}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsCartOpen(false);
                  navigate('/checkout');
                }}
                className="w-full gold-btn py-3 rounded-xl text-xs font-extrabold uppercase tracking-widest"
              >
                PROCEED TO CHECKOUT
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
