import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiStar, FiHeart, FiShoppingBag, FiTruck, FiRefreshCw, FiShield, FiCheck, FiShare2 } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import API from '../services/api';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const { data } = await API.get(`/products/${id}`);
      setProduct(data);
      setSelectedImage(data.images?.[0] || '');
      setSelectedColor(data.colors?.[0]?.name || 'Standard');
      setSelectedSize(data.sizes?.[0] || 'M');
    } catch (error) {
      console.error('Error loading product details', error);
      toast.error('Product not found');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center text-gray-400">
        Loading haute couture details...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-4">
        <p className="text-xl font-bold text-white">Product not found</p>
        <Link to="/shop" className="gold-btn px-6 py-2.5 rounded-full text-xs font-bold uppercase inline-block">
          RETURN TO SHOP
        </Link>
      </div>
    );
  }

  const isLiked = isInWishlist(product._id);
  const displayPrice = product.salePrice > 0 ? product.salePrice : product.price;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Product Top Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-[4/5] bg-[#141414] rounded-2xl overflow-hidden border border-[#2A2A2A] group">
            <img
              src={selectedImage}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
            />
            {product.isFlashSale && (
              <span className="absolute top-4 left-4 bg-red-600 text-white text-xs font-extrabold px-3 py-1 rounded-full uppercase">
                FLASH SALE
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images?.length > 1 && (
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-24 rounded-xl overflow-hidden border-2 transition ${
                    selectedImage === img ? 'border-[#D4AF37]' : 'border-[#2A2A2A] opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="Thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details & Selection */}
        <div className="space-y-6">
          <div>
            <span className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest">{product.brand || 'ANTIGRAVITY ATELIER'}</span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white uppercase tracking-tight mt-1">{product.title}</h1>
            <div className="flex items-center space-x-4 mt-2">
              <div className="flex items-center space-x-1 text-[#D4AF37]">
                <FiStar className="fill-current" size={16} />
                <span className="text-sm font-bold text-white">{product.rating}</span>
                <span className="text-xs text-gray-500">({product.numReviews} Reviews)</span>
              </div>
              <span className="text-xs text-gray-500 font-mono">SKU: {product.sku}</span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-baseline space-x-3 pt-2 border-t border-[#2A2A2A]">
            <span className="text-3xl font-extrabold text-[#D4AF37]">GH₵ {displayPrice.toLocaleString()}</span>
            {product.salePrice > 0 && product.price > product.salePrice && (
              <span className="text-lg text-gray-500 line-through">GH₵ {product.price.toLocaleString()}</span>
            )}
          </div>

          {/* Stock Indicator */}
          <div className="flex items-center space-x-2 text-xs">
            <span className={`w-2.5 h-2.5 rounded-full ${product.stock > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-gray-300">
              {product.stock > 0 ? `In Stock (${product.stock} items available)` : 'Out of Stock'}
            </span>
          </div>

          {/* Colors */}
          {product.colors?.length > 0 && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-300 uppercase">
                Color: <span className="text-[#D4AF37]">{selectedColor}</span>
              </label>
              <div className="flex space-x-3">
                {product.colors.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setSelectedColor(c.name)}
                    className={`w-9 h-9 rounded-full border-2 p-0.5 flex items-center justify-center transition ${
                      selectedColor === c.name ? 'border-[#D4AF37]' : 'border-transparent'
                    }`}
                  >
                    <span className="w-full h-full rounded-full border border-[#2A2A2A]" style={{ backgroundColor: c.hex }} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
          {product.sizes?.length > 0 && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-300 uppercase">
                Size: <span className="text-[#D4AF37]">{selectedSize}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`px-4 py-2 text-xs font-bold rounded-xl border transition ${
                      selectedSize === s
                        ? 'bg-[#D4AF37] text-black border-[#D4AF37]'
                        : 'bg-[#141414] border-[#2A2A2A] text-gray-300 hover:border-white'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Actions */}
          <div className="flex space-x-4 pt-4">
            <div className="flex items-center border border-[#2A2A2A] rounded-xl bg-[#141414] px-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="text-gray-400 hover:text-white px-2 py-3"
              >
                -
              </button>
              <span className="text-sm font-bold text-white px-3">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="text-gray-400 hover:text-white px-2 py-3"
              >
                +
              </button>
            </div>

            <button
              onClick={() => addToCart(product, selectedColor, selectedSize, quantity)}
              className="flex-1 gold-btn py-4 rounded-xl text-xs font-extrabold uppercase tracking-widest flex items-center justify-center space-x-2"
            >
              <FiShoppingBag size={18} />
              <span>ADD TO SHOPPING BAG</span>
            </button>

            <button
              onClick={() => toggleWishlist(product)}
              className={`p-4 rounded-xl border border-[#2A2A2A] transition ${
                isLiked ? 'bg-red-600 text-white border-red-600' : 'bg-[#141414] text-gray-300 hover:text-white'
              }`}
            >
              <FiHeart size={20} className={isLiked ? 'fill-current' : ''} />
            </button>
          </div>

          {/* Value props */}
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-[#2A2A2A] text-xs text-gray-400">
            <div className="flex items-center space-x-2">
              <FiTruck className="text-[#D4AF37]" size={16} />
              <span>Complimentary Express Shipping</span>
            </div>
            <div className="flex items-center space-x-2">
              <FiRefreshCw className="text-[#D4AF37]" size={16} />
              <span>14-Day Complimentary Returns</span>
            </div>
            <div className="flex items-center space-x-2">
              <FiShield className="text-[#D4AF37]" size={16} />
              <span>Paystack Secured Transaction</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-t border-[#2A2A2A] pt-10">
        <div className="flex space-x-8 border-b border-[#2A2A2A] pb-3 text-sm font-bold uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('description')}
            className={activeTab === 'description' ? 'text-[#D4AF37] border-b-2 border-[#D4AF37] pb-3' : 'text-gray-400'}
          >
            DESCRIPTION
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={activeTab === 'specs' ? 'text-[#D4AF37] border-b-2 border-[#D4AF37] pb-3' : 'text-gray-400'}
          >
            SPECIFICATIONS
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={activeTab === 'reviews' ? 'text-[#D4AF37] border-b-2 border-[#D4AF37] pb-3' : 'text-gray-400'}
          >
            REVIEWS ({product.numReviews})
          </button>
        </div>

        <div className="py-6 text-sm text-gray-300 leading-relaxed">
          {activeTab === 'description' && <p>{product.description}</p>}
          {activeTab === 'specs' && (
            <ul className="space-y-2">
              {product.specifications?.map((sp, i) => (
                <li key={i} className="flex justify-between border-b border-[#1F1F1F] py-2 max-w-md">
                  <span className="text-gray-500">{sp.key}</span>
                  <span className="font-semibold text-white">{sp.value}</span>
                </li>
              ))}
            </ul>
          )}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4 bg-[#141414] p-4 rounded-xl border border-[#2A2A2A]">
                <span className="text-4xl font-extrabold text-[#D4AF37]">{product.rating}</span>
                <div>
                  <div className="flex text-[#D4AF37]">
                    {[...Array(5)].map((_, i) => (
                      <FiStar key={i} className="fill-current" size={16} />
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Based on {product.numReviews} verified customer reviews</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
