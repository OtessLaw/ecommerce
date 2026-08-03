import React, { useState, useEffect } from 'react';
import { FiShoppingBag, FiX } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const mockSocialProofData = [
  { name: 'Kofi A.', location: 'Accra, Ghana', item: 'J&J Vintage Leather Biker Jacket', time: '2 mins ago', price: 'GH₵ 3', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=400&q=80' },
  { name: 'Abena M.', location: 'Kumasi, Ghana', item: 'J&J Vintage Silk Evening Gown', time: '5 mins ago', price: 'GH₵ 3', image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=400&q=80' },
  { name: 'Kwame P.', location: 'Takoradi, Ghana', item: 'J&J Vintage Gold Runner Sneakers', time: '8 mins ago', price: 'GH₵ 2', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80' },
  { name: 'Esi K.', location: 'Tema, Ghana', item: 'J&J Vintage Chronograph Watch', time: '12 mins ago', price: 'GH₵ 3', image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=400&q=80' },
  { name: 'Yaw B.', location: 'Cape Coast, Ghana', item: 'J&J Vintage Cashmere Hoodie', time: '15 mins ago', price: 'GH₵ 1', image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=400&q=80' },
];

export default function SocialProofToast() {
  const [currentNotification, setCurrentNotification] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setCurrentNotification(mockSocialProofData[index % mockSocialProofData.length]);
      setVisible(true);
      index++;

      // Hide after 6 seconds
      setTimeout(() => {
        setVisible(false);
      }, 6000);
    }, 18000); // Trigger every 18 seconds

    // First trigger after 4 seconds
    const firstTimer = setTimeout(() => {
      setCurrentNotification(mockSocialProofData[0]);
      setVisible(true);
      setTimeout(() => setVisible(false), 6000);
    }, 4000);

    return () => {
      clearInterval(interval);
      clearTimeout(firstTimer);
    };
  }, []);

  if (!visible || !currentNotification) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 sm:right-auto sm:bottom-6 sm:left-6 z-30 max-w-xs sm:max-w-sm bg-[#141414]/95 backdrop-blur-md border border-[#D4AF37]/30 rounded-2xl p-3.5 shadow-2xl flex items-center space-x-3.5 animate-fadeIn">
      <img
        src={currentNotification.image}
        alt={currentNotification.item}
        className="w-12 h-12 object-cover rounded-xl border border-[#2A2A2A]"
      />

      <div className="flex-1 min-w-0 text-xs">
        <p className="text-[10px] text-gray-400 font-semibold">
          <strong className="text-white">{currentNotification.name}</strong> in {currentNotification.location}
        </p>
        <p className="font-bold text-[#D4AF37] truncate">{currentNotification.item}</p>
        <p className="text-[10px] text-gray-500 mt-0.5">Purchased • {currentNotification.time}</p>
      </div>

      <button onClick={() => setVisible(false)} className="text-gray-500 hover:text-white p-1">
        <FiX size={16} />
      </button>
    </div>
  );
}
