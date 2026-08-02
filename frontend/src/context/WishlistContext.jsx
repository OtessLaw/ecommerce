import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('luxury_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('luxury_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const toggleWishlist = (product) => {
    const exists = wishlist.some((item) => item._id === product._id);

    if (exists) {
      setWishlist((prev) => prev.filter((item) => item._id !== product._id));
      toast.success(`Removed ${product.title} from wishlist`);
    } else {
      setWishlist((prev) => [...prev, product]);
      toast.success(`Saved ${product.title} to wishlist`);
    }
  };

  const isInWishlist = (productId) => wishlist.some((item) => item._id === productId);

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
