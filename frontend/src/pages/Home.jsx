import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LuxuryHero from '../components/hero/LuxuryHero';
import ProductCard from '../components/product/ProductCard';
import { GridSkeleton } from '../components/common/LoadingSkeleton';
import API from '../services/api';
import { FiArrowRight, FiClock, FiShield, FiStar, FiInstagram } from 'react-icons/fi';
import { motion } from 'framer-motion';

const featuredCategories = [
  { name: 'Men', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80', count: '48 Items' },
  { name: 'Women', image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80', count: '62 Items' },
  { name: 'Shoes', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80', count: '35 Items' },
  { name: 'Jewelry', image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80', count: '29 Items' },
];

export default function Home() {
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [flashSaleProducts, setFlashSaleProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Flash Sale Countdown Timer
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 35, seconds: 50 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await API.get('/products');
        const prods = data.products || [];
        setTrendingProducts(prods.filter((p) => p.isTrending || p.isFeatured).slice(0, 3));
        setNewArrivals(prods.filter((p) => p.isNewArrival).slice(0, 3));
        setFlashSaleProducts(prods.filter((p) => p.isFlashSale || p.salePrice > 0).slice(0, 3));
      } catch (error) {
        console.error('Error fetching home products', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="space-y-20">
      {/* Luxury Hero Banner */}
      <LuxuryHero />

      {/* Featured Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8">
          <div>
            <span className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest">CURATED CATEGORIES</span>
            <h2 className="text-3xl font-extrabold text-white tracking-tight uppercase mt-1">
              THE <span className="gold-gradient-text">J&J VINTAGE</span> DEPARTMENTS
            </h2>
          </div>
          <Link to="/shop" className="text-xs text-[#D4AF37] font-bold uppercase tracking-wider flex items-center space-x-1 hover:underline mt-2 md:mt-0">
            <span>VIEW ALL DEPARTMENTS</span>
            <FiArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredCategories.map((cat) => (
            <Link
              key={cat.name}
              to={`/shop?category=${encodeURIComponent(cat.name)}`}
              className="group relative h-96 rounded-2xl overflow-hidden border border-[#2A2A2A] hover:border-[#D4AF37]/50 transition-all duration-300 shadow-glass"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <span className="text-xs text-[#D4AF37] font-bold uppercase tracking-widest">{cat.count}</span>
                <h3 className="text-2xl font-extrabold text-white uppercase mt-1 group-hover:text-[#D4AF37] transition">
                  {cat.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Flash Sale Banner Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#141414] via-[#1F1F1F] to-[#141414] border border-[#D4AF37]/30 p-8 sm:p-12">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
            <div className="space-y-4 max-w-xl text-center lg:text-left">
              <span className="bg-red-600/20 text-red-400 border border-red-500/30 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center space-x-1">
                <FiClock size={14} />
                <span>LIMITED TIME FLASH SALE</span>
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white uppercase tracking-tight">
                UP TO <span className="gold-gradient-text">40% OFF</span> LUXURY EDIT
              </h2>
              <p className="text-gray-400 text-xs sm:text-sm">
                Exclusive seasonal reduction on Italian calfskin jackets, tailored suits, and silk evening gowns.
              </p>

              {/* Countdown timer blocks */}
              <div className="flex justify-center lg:justify-start space-x-3 pt-2">
                <div className="bg-[#0B0B0B] border border-[#2A2A2A] px-4 py-2 rounded-xl text-center">
                  <span className="text-2xl font-extrabold text-[#D4AF37]">{String(timeLeft.hours).padStart(2, '0')}</span>
                  <span className="block text-[10px] text-gray-500 uppercase">HOURS</span>
                </div>
                <div className="bg-[#0B0B0B] border border-[#2A2A2A] px-4 py-2 rounded-xl text-center">
                  <span className="text-2xl font-extrabold text-[#D4AF37]">{String(timeLeft.minutes).padStart(2, '0')}</span>
                  <span className="block text-[10px] text-gray-500 uppercase">MINS</span>
                </div>
                <div className="bg-[#0B0B0B] border border-[#2A2A2A] px-4 py-2 rounded-xl text-center">
                  <span className="text-2xl font-extrabold text-[#D4AF37]">{String(timeLeft.seconds).padStart(2, '0')}</span>
                  <span className="block text-[10px] text-gray-500 uppercase">SECS</span>
                </div>
              </div>
            </div>

            <Link to="/shop?isFlashSale=true" className="gold-btn px-8 py-4 rounded-xl text-xs font-extrabold uppercase tracking-widest shadow-gold whitespace-nowrap">
              SHOP THE FLASH SALE NOW
            </Link>
          </div>
        </div>
      </section>

      {/* Trending Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <span className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest">MOST COVETED</span>
            <h2 className="text-3xl font-extrabold text-white tracking-tight uppercase mt-1">
              TRENDING <span className="gold-gradient-text">LUXURY SELECTIONS</span>
            </h2>
          </div>
          <Link to="/shop?sort=popular" className="text-xs text-[#D4AF37] font-bold uppercase tracking-wider flex items-center space-x-1 hover:underline">
            <span>EXPLORE TRENDING</span>
            <FiArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <GridSkeleton count={3} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* Instagram Runway Gallery */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="text-center space-y-2 mb-10">
          <div className="flex justify-center items-center space-x-2 text-[#D4AF37]">
            <FiInstagram size={20} />
            <span className="text-xs font-bold uppercase tracking-widest">@JNJ_VINTAGE</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white uppercase tracking-tight">
            RUNWAY <span className="gold-gradient-text">& STREET INSPIRATION</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=600&q=80',
          ].map((imgUrl, i) => (
            <div key={i} className="group relative aspect-square rounded-xl overflow-hidden border border-[#2A2A2A]">
              <img src={imgUrl} alt="Runway" className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                <FiInstagram size={24} className="text-[#D4AF37]" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
