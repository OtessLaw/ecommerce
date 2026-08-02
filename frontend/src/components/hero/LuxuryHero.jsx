import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const slides = [
  {
    id: 1,
    title: 'THE HAUTE COUTURE COLLECTION',
    subtitle: 'AUTOMNE / HIVER 2026',
    description: 'Immaculate Italian leather jacketry, Mulberry silk gowns, and bespoke chronometers crafted for discerning connoisseurs.',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=2000&q=85',
    ctaText: 'DISCOVER COLLECTION',
    ctaLink: '/shop?category=Luxury',
  },
  {
    id: 2,
    title: 'HIGH-PERFORMANCE RUNNER SNEAKERS',
    subtitle: 'VELOCITY GOLD SERIES',
    description: 'Merging streetwear athletic innovation with 18K gold foil accents and ultra-responsive cushioning.',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=2000&q=85',
    ctaText: 'SHOP FOOTWEAR',
    ctaLink: '/shop?category=Sneakers',
  },
  {
    id: 3,
    title: 'BESPOKE EVENING SILK GOWNS',
    subtitle: 'RED CARPET COUTURE',
    description: 'Floor-length silk satin gowns with hand-embroidered metallic accents designed to captivate every room.',
    image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=2000&q=85',
    ctaText: 'EXPLORE GOWNS',
    ctaLink: '/shop?category=Women',
  },
];

export default function LuxuryHero() {
  return (
    <div className="relative w-full h-[85vh] bg-[#0A0A0A] overflow-hidden">
      <Swiper
        modules={[Autoplay, Pagination, EffectFade]}
        effect="fade"
        autoplay={{ delay: 6000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        loop={true}
        className="w-full h-full"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id} className="relative w-full h-full">
            {/* Background Image with Dark Vignette */}
            <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${slide.image})` }}>
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B] via-transparent to-black/50" />
            </div>

            {/* Slide Content */}
            <div className="relative max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-2xl space-y-6"
              >
                <span className="inline-block px-3 py-1 bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-bold uppercase tracking-widest rounded-full">
                  {slide.subtitle}
                </span>
                <h1 className="text-4xl sm:text-6xl font-extrabold font-display text-white leading-tight tracking-tight uppercase">
                  {slide.title.split(' ')[0]} <span className="gold-gradient-text">{slide.title.split(' ').slice(1).join(' ')}</span>
                </h1>
                <p className="text-gray-300 text-sm sm:text-base leading-relaxed font-light">
                  {slide.description}
                </p>
                <div className="pt-4 flex flex-wrap gap-4">
                  <Link
                    to={slide.ctaLink}
                    className="gold-btn px-8 py-4 rounded-xl text-xs font-extrabold uppercase tracking-widest shadow-gold inline-block"
                  >
                    {slide.ctaText}
                  </Link>
                  <Link
                    to="/shop?isFlashSale=true"
                    className="bg-[#141414]/80 hover:bg-[#2A2A2A] text-white border border-[#2A2A2A] px-8 py-4 rounded-xl text-xs font-bold uppercase tracking-widest backdrop-blur-md transition inline-block"
                  >
                    EXPLORE FLASH SALE
                  </Link>
                </div>
              </motion.div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
