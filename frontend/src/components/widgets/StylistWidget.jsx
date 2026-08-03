import React, { useState } from 'react';
import { FiMessageSquare, FiX, FiSend, FiCompass, FiCheckCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';

export default function StylistWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'stylist',
      text: 'Welcome to J&J Vintage Atelier! I am your AI Personal Stylist. How can I assist with your luxury outfit selection today?',
      recommendation: null,
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const quickPrompts = [
    '✨ Style me for an Evening Gala',
    '🕶️ Vintage Streetwear Look',
    '⌚ Matching Accessories for Leather Jacket',
    '📏 Help me find my size',
  ];

  const handleSend = (textToSend) => {
    const userMsg = textToSend || input;
    if (!userMsg.trim()) return;

    const newMsgs = [...messages, { sender: 'user', text: userMsg }];
    setMessages(newMsgs);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      let replyText = 'For a truly timeless luxury look, we recommend pairing our handcrafted J&J Vintage Leather Biker Jacket with Gold Runner Sneakers and the Chronograph Watch.';
      let rec = {
        title: 'J&J Vintage Leather Biker Jacket',
        price: 'GH₵ 3',
        link: '/shop?category=Outerwear',
        image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80',
      };

      const lower = userMsg.toLowerCase();
      if (lower.includes('gala') || lower.includes('evening') || lower.includes('gown')) {
        replyText = 'For an unforgettable Evening Gala, our Silk Evening Gown paired with 18K Gold Chronograph Watch creates unmatched sophistication.';
        rec = {
          title: 'J&J Vintage Silk Evening Gown',
          price: 'GH₵ 3',
          link: '/shop?category=Dresses',
          image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=600&q=80',
        };
      } else if (lower.includes('street') || lower.includes('hoodie') || lower.includes('casual')) {
        replyText = 'For elevated vintage streetwear, style the J&J Vintage Cashmere Hoodie with our Gold Runner Sneakers.';
        rec = {
          title: 'J&J Vintage Gold Runner Sneakers',
          price: 'GH₵ 2',
          link: '/shop?category=Sneakers',
          image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
        };
      } else if (lower.includes('size') || lower.includes('fit')) {
        replyText = 'Our J&J Vintage garments feature a tailored European fit. If you prefer a relaxed vintage oversized silhouette, we suggest ordering one size up!';
        rec = null;
      }

      setMessages([...newMsgs, { sender: 'stylist', text: replyText, recommendation: rec }]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-[#D4AF37] to-[#9E7B3B] text-black p-3.5 sm:p-4 rounded-full shadow-2xl hover:scale-105 transition-all duration-300 flex items-center space-x-2 border border-[#FFF0B9]/40 group"
      >
        <FiCompass size={22} className="animate-spin-slow" />
        <span className="hidden sm:inline text-xs font-extrabold uppercase tracking-wider pr-1">
          AI STYLIST
        </span>
      </button>

      {/* Stylist Modal Drawer */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-50 w-full max-w-sm sm:max-w-md bg-[#141414] border border-[#2A2A2A] rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[500px] animate-fadeIn">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#1A1A1A] to-[#111111] p-4 border-b border-[#2A2A2A] flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
                <FiCompass size={20} />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-white uppercase tracking-tight">J&J STYLIST CONCIERGE</h4>
                <p className="text-[10px] text-emerald-400 font-semibold flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>ONLINE • AI PERSONAL ASSISTANT</span>
                </p>
              </div>
            </div>

            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white p-1">
              <FiX size={20} />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs bg-[#0B0B0B]/50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] p-3 rounded-2xl ${
                    m.sender === 'user'
                      ? 'bg-[#D4AF37] text-black font-semibold rounded-br-none'
                      : 'bg-[#1A1A1A] text-gray-200 border border-[#2A2A2A] rounded-bl-none space-y-2'
                  }`}
                >
                  <p className="leading-relaxed">{m.text}</p>

                  {m.recommendation && (
                    <div className="bg-[#101010] p-2.5 rounded-xl border border-[#2A2A2A] flex items-center space-x-3 mt-2">
                      <img src={m.recommendation.image} alt={m.recommendation.title} className="w-12 h-12 object-cover rounded-lg" />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white truncate text-[11px]">{m.recommendation.title}</p>
                        <p className="text-[#D4AF37] font-extrabold text-[11px]">{m.recommendation.price}</p>
                        <Link
                          to={m.recommendation.link}
                          onClick={() => setIsOpen(false)}
                          className="text-[10px] text-[#D4AF37] underline font-semibold mt-0.5 block"
                        >
                          View Collection →
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-[#1A1A1A] p-3 rounded-2xl border border-[#2A2A2A] text-gray-400 text-[11px] flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-bounce delay-100" />
                  <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-bounce delay-200" />
                  <span>Curating luxury suggestions...</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          <div className="px-3 py-2 bg-[#141414] border-t border-[#2A2A2A] overflow-x-auto flex space-x-2 whitespace-nowrap scrollbar-none">
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(qp)}
                className="text-[10px] bg-[#1A1A1A] hover:bg-[#D4AF37] hover:text-black text-gray-300 font-semibold px-3 py-1.5 rounded-full border border-[#2A2A2A] transition"
              >
                {qp}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-[#141414] border-t border-[#2A2A2A] flex space-x-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask your stylist anything..."
              className="flex-1 bg-[#1A1A1A] text-white text-xs rounded-xl px-3 py-2.5 border border-[#2A2A2A] focus:border-[#D4AF37] outline-none"
            />
            <button type="submit" className="gold-btn p-2.5 rounded-xl text-black">
              <FiSend size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
