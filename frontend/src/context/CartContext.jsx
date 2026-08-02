import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import API from '../services/api';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('luxury_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [coupon, setCoupon] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('luxury_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, selectedColor, selectedSize, quantity = 1) => {
    const color = selectedColor || (product.colors?.[0]?.name || 'Standard');
    const size = selectedSize || (product.sizes?.[0] || 'M');

    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product === product._id && item.selectedColor === color && item.selectedSize === size
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [
          ...prev,
          {
            product: product._id,
            title: product.title,
            price: product.salePrice > 0 ? product.salePrice : product.price,
            originalPrice: product.price,
            image: product.images?.[0] || 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80',
            selectedColor: color,
            selectedSize: size,
            quantity,
            stock: product.stock,
          },
        ];
      }
    });

    toast.success(`Added ${product.title} to bag!`);
    setIsCartOpen(true);
  };

  const removeFromCart = (productId, color, size) => {
    setCartItems((prev) =>
      prev.filter((item) => !(item.product === productId && item.selectedColor === color && item.selectedSize === size))
    );
    toast.success('Item removed from bag');
  };

  const updateQuantity = (productId, color, size, qty) => {
    if (qty <= 0) {
      removeFromCart(productId, color, size);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.product === productId && item.selectedColor === color && item.selectedSize === size
          ? { ...item, quantity: qty }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setCoupon(null);
  };

  const applyCoupon = async (code) => {
    try {
      const { data } = await API.post('/admin/coupons/validate', { code });
      setCoupon(data);
      toast.success(`Coupon '${data.code}' applied! (${data.discountPercentage}% OFF)`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid coupon code');
    }
  };

  // Calculations
  const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discountAmount = coupon ? Math.round((itemsPrice * coupon.discountPercentage) / 100) : 0;
  const taxableAmount = Math.max(0, itemsPrice - discountAmount);
  const vatAmount = Math.round(taxableAmount * 0.05); // 5% VAT
  const shippingPrice = itemsPrice >= 50 || itemsPrice === 0 ? 0 : 1;
  const totalPrice = taxableAmount + vatAmount + shippingPrice;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        coupon,
        applyCoupon,
        isCartOpen,
        setIsCartOpen,
        itemsPrice,
        discountAmount,
        vatAmount,
        shippingPrice,
        totalPrice,
        itemCount: cartItems.reduce((acc, item) => acc + item.quantity, 0),
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
