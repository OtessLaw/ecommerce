import React from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingBag, FiStar } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCurrency } from '../../context/CurrencyContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { formatPrice } = useCurrency();

  const isLiked = isInWishlist(product._id);
  const displayPrice = product.salePrice > 0 ? product.salePrice : product.price;

  return (
    <div className="group bg-[#141414] border border-[#2A2A2A] rounded-2xl overflow-hidden hover:border-[#D4AF37]/50 transition-all duration-300 flex flex-col justify-between hover:shadow-gold">
      {/* Image Header */}
      <div className="relative overflow-hidden bg-[#1F1F1F] aspect-[4/5]">
        <Link to={`/product/${product._id || product.slug}`}>
          <img
            src={product.images?.[0] || 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80'}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col space-y-1 z-10">
          {product.isFlashSale && (
            <span className="bg-red-600 text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full tracking-wider shadow">
              FLASH SALE {product.discountPercentage > 0 ? `-${product.discountPercentage}%` : ''}
            </span>
          )}
          {product.isNewArrival && !product.isFlashSale && (
            <span className="bg-[#D4AF37] text-black text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full tracking-wider shadow">
              NEW ARRIVAL
            </span>
          )}
        </div>

        {/* Heart Wishlist Button */}
        <button
          onClick={() => toggleWishlist(product)}
          className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md transition-all duration-200 z-10 ${
            isLiked ? 'bg-red-600 text-white' : 'bg-black/40 text-gray-300 hover:text-white hover:bg-black/70'
          }`}
        >
          <FiHeart size={16} className={isLiked ? 'fill-current' : ''} />
        </button>

        {/* Quick Add Overlay */}
        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={() => addToCart(product)}
            className="w-full bg-[#0B0B0B]/90 hover:bg-[#D4AF37] hover:text-black text-white text-xs font-bold py-2.5 rounded-xl border border-[#D4AF37]/30 flex items-center justify-center space-x-2 backdrop-blur-md transition-all"
          >
            <FiShoppingBag size={14} />
            <span>ADD TO BAG</span>
          </button>
        </div>
      </div>

      {/* Details */}
      <div className="p-5 space-y-2">
        <div className="flex justify-between items-center text-[11px] text-gray-400 uppercase tracking-widest font-semibold">
          <span>{product.brand || 'J&J VINTAGE'}</span>
          <div className="flex items-center space-x-1 text-[#D4AF37]">
            <FiStar size={12} className="fill-current" />
            <span>{product.rating || 4.9}</span>
          </div>
        </div>

        <Link to={`/product/${product._id || product.slug}`} className="block">
          <h3 className="text-sm font-semibold text-white group-hover:text-[#D4AF37] transition-colors truncate">
            {product.title}
          </h3>
        </Link>

        {/* Price Tag */}
        <div className="flex items-baseline space-x-2 pt-1">
          <span className="text-base font-extrabold text-white">{formatPrice(displayPrice)}</span>
          {product.salePrice > 0 && product.price > product.salePrice && (
            <span className="text-xs text-gray-500 line-through">{formatPrice(product.price)}</span>
          )}
        </div>
      </div>
    </div>
  );
}
