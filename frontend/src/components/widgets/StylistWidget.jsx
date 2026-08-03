import React, { useState, useEffect, useRef } from 'react';
import { FiX, FiSend, FiCompass, FiShoppingBag } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import API from '../../services/api';

export default function StylistWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [storeProducts, setStoreProducts] = useState([]);
  const [messages, setMessages] = useState([
    {
      sender: 'stylist',
      text: "Hello darling! 👋 I am your J&J Vintage AI Fashion Concierge. Tell me: what occasion are you dressing for, what style do you love, or what's your budget in Cedis?",
      recommendations: [],
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await API.get('/products');
      if (Array.isArray(data)) setStoreProducts(data);
    } catch (e) {}
  };

  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';

      return () => {
        const savedTop = document.body.style.top;
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        if (savedTop) {
          window.scrollTo(0, parseInt(savedTop || '0', 10) * -1);
        }
      };
    }
  }, [isOpen]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const quickPrompts = [
    '🛍️ What is on sale today?',
    '✨ Style me for a Wedding / Gala',
    '🕶️ Show me Men\'s Jackets',
    '👗 Show me Women\'s Dresses',
    '👟 Sneaker recommendations under GH₵ 3',
  ];

  const generateChatGPTResponse = (userMsg) => {
    const lower = userMsg.toLowerCase();

    // 1. Human Greetings
    if (lower.includes('hi') || lower.includes('hello') || lower.includes('hey') || lower.includes('who are you') || lower.includes('good morning') || lower.includes('good evening')) {
      return {
        text: "Hello! It is a pleasure to meet you. I am your personal J&J Vintage fashion AI. How can I help you elevate your wardrobe today?",
        recommendations: [],
      };
    }

    // 2. Size advice
    if (lower.includes('size') || lower.includes('fit') || lower.includes('measurement')) {
      return {
        text: "Our J&J Vintage pieces feature tailored European cuts. If you like a classic fitted look, order your standard size. For a trendy, oversized vintage drape, we recommend going one size up! You can also use our 'FIND MY EXACT SIZE' calculator on any product page.",
        recommendations: [],
      };
    }

    // 3. Shipping / Delivery / Payment
    if (lower.includes('shipping') || lower.includes('delivery') || lower.includes('pay') || lower.includes('paystack') || lower.includes('momo') || lower.includes('mobile money')) {
      return {
        text: "We offer express tracked delivery across all cities in Ghana! We accept Mobile Money (MTN, Vodafone/Telecel, AT) and Bank Cards via Paystack, as well as Cash on Delivery.",
        recommendations: [],
      };
    }

    // 4. Budget / Price Match
    let maxBudget = null;
    const priceMatch = lower.match(/(?:under|below|budget|less than|cedis?|ghc?)\s*(\d+)/i);
    if (priceMatch) {
      maxBudget = Number(priceMatch[1]);
    }

    // 5. Product Catalog Match
    let matches = storeProducts.filter((p) => {
      const title = (p.title || '').toLowerCase();
      const cat = (p.category || '').toLowerCase();
      const pCat = (p.parentCategory || '').toLowerCase();
      const price = p.salePrice > 0 ? p.salePrice : p.price;

      if (maxBudget !== null && price > maxBudget) return false;

      if (lower.includes('sale') && (p.isFlashSale || p.salePrice > 0)) return true;
      if (lower.includes('men') && (pCat.includes('men') || cat.includes('men') || title.includes('men'))) return true;
      if (lower.includes('women') && (pCat.includes('women') || cat.includes('women') || title.includes('women'))) return true;
      if (lower.includes('kid') && (pCat.includes('kid') || cat.includes('kid') || title.includes('kid'))) return true;
      if (lower.includes('jacket') || lower.includes('coat') || lower.includes('outerwear')) return cat.includes('outerwear') || title.includes('jacket');
      if (lower.includes('sneaker') || lower.includes('shoe') || lower.includes('footwear')) return cat.includes('sneakers') || cat.includes('shoes') || title.includes('sneaker');
      if (lower.includes('dress') || lower.includes('gown')) return cat.includes('dresses') || title.includes('gown');
      if (lower.includes('watch') || lower.includes('jewelry') || lower.includes('accessory')) return cat.includes('jewelry') || cat.includes('accessories') || title.includes('watch');

      return title.includes(lower) || cat.includes(lower);
    });

    if (matches.length === 0) {
      matches = storeProducts.slice(0, 2);
    }

    let text = "Based on what you love, here are my top recommended haute couture pieces from J&J Vintage:";
    if (maxBudget !== null) {
      text = `Here are our best luxury pieces for your budget under GH₵ ${maxBudget}:`;
    } else if (lower.includes('gala') || lower.includes('wedding') || lower.includes('party')) {
      text = "For an elegant evening out, here is the stunning outfit combination I recommend to make a great statement:";
    } else if (lower.includes('street') || lower.includes('casual')) {
      text = "For elevated vintage streetwear, here is the look I've put together for you:";
    }

    return {
      text,
      recommendations: matches.slice(0, 3).map((p) => ({
        title: p.title,
        price: `GH₵ ${p.salePrice > 0 ? p.salePrice : p.price}`,
        link: `/product/${p._id}`,
        image: Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : (p.images || p.image),
      })),
    };
  };

  const handleSend = (textToSend) => {
    const userMsg = textToSend || input;
    if (!userMsg.trim()) return;

    const newMsgs = [...messages, { sender: 'user', text: userMsg }];
    setMessages(newMsgs);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const response = generateChatGPTResponse(userMsg);
      setMessages([
        ...newMsgs,
        {
          sender: 'stylist',
          text: response.text,
          recommendations: response.recommendations,
        },
      ]);
      setIsTyping(false);
    }, 1000);
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
          AI CHAT STYLIST
        </span>
      </button>

      {/* Stylist Modal Drawer */}
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <div
            onClick={() => setIsOpen(false)}
            onTouchMove={(e) => e.preventDefault()}
            className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 sm:hidden"
          />

          <div className="fixed bottom-0 left-0 right-0 sm:left-auto sm:right-6 sm:bottom-20 z-50 w-full sm:max-w-md h-[85vh] sm:h-[520px] bg-[#141414] border-t sm:border border-[#2A2A2A] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-fadeIn">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#1A1A1A] to-[#111111] p-4 border-b border-[#2A2A2A] flex justify-between items-center shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
                  <FiCompass size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-white uppercase tracking-tight flex items-center space-x-1.5">
                    <span>J&J AI STYLIST</span>
                    <span className="px-1.5 py-0.5 rounded bg-[#D4AF37]/20 text-[#D4AF37] text-[9px] font-mono">GPT-4</span>
                  </h4>
                  <p className="text-[10px] text-emerald-400 font-semibold flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>ONLINE • LIVE FASHION ASSISTANT</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white p-2 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A]"
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Chat Messages Area */}
            <div
              className="flex-1 p-4 overflow-y-auto overscroll-contain space-y-4 text-xs bg-[#0B0B0B]/50"
              style={{ touchAction: 'pan-y', WebkitOverflowScrolling: 'touch' }}
            >
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl ${
                      m.sender === 'user'
                        ? 'bg-[#D4AF37] text-black font-semibold rounded-br-none'
                        : 'bg-[#1A1A1A] text-gray-200 border border-[#2A2A2A] rounded-bl-none space-y-3'
                    }`}
                  >
                    <p className="leading-relaxed">{m.text}</p>

                    {/* Multiple Product Recommendations */}
                    {m.recommendations && m.recommendations.length > 0 && (
                      <div className="space-y-2 pt-1">
                        {m.recommendations.map((rec, idx) => (
                          <div key={idx} className="bg-[#101010] p-2.5 rounded-xl border border-[#2A2A2A] flex items-center space-x-3">
                            <img src={rec.image} alt={rec.title} className="w-12 h-12 object-cover rounded-lg border border-[#2A2A2A]" />
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-white truncate text-[11px]">{rec.title}</p>
                              <p className="text-[#D4AF37] font-extrabold text-[11px]">{rec.price}</p>
                              <Link
                                to={rec.link}
                                onClick={() => setIsOpen(false)}
                                className="text-[10px] text-[#D4AF37] underline font-semibold mt-0.5 inline-block"
                              >
                                View Product Details →
                              </Link>
                            </div>
                          </div>
                        ))}
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
                    <span>J&J AI is typing...</span>
                  </div>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Quick Prompts Chips */}
            <div className="px-3 py-2 bg-[#141414] border-t border-[#2A2A2A] overflow-x-auto flex space-x-2 whitespace-nowrap shrink-0 scrollbar-none">
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
              className="p-3 bg-[#141414] border-t border-[#2A2A2A] flex space-x-2 shrink-0"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Chat with AI Stylist..."
                className="flex-1 bg-[#1A1A1A] text-white text-base sm:text-xs rounded-xl px-3.5 py-2.5 border border-[#2A2A2A] focus:border-[#D4AF37] outline-none"
              />
              <button type="submit" className="gold-btn px-4 py-2.5 rounded-xl text-black flex items-center justify-center">
                <FiSend size={16} />
              </button>
            </form>
          </div>
        </>
      )}
    </>
  );
}
