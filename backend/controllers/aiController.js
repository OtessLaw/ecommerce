const axios = require('axios');
const Product = require('../models/Product');
const { initialProducts } = require('../utils/seedData');

// Comprehensive Conversational Fallback Engine
function generateLocalFallback(userQuery, products) {
  const lower = userQuery.toLowerCase().trim();

  // 1. How are you / Status questions
  if (lower.match(/\b(how are (you|u)|how u doin|how are u doing|how is it going|how do you do|how have you been)\b/)) {
    return "I'm doing wonderfully, thank you for asking! 😊 I'm here and ready to assist you with styling, outfit ideas, sizing, or any questions you have. How are you doing today?";
  }

  // 2. Greetings & Who are you
  if (lower.match(/\b(hi|hello|hey|greetings|good morning|good afternoon|good evening|who are you|what is your name)\b/)) {
    return "Hello! 👋 I am your J&J Vintage AI Fashion Concierge. It's a pleasure to connect with you. What can I help you discover or style today?";
  }

  // 3. Gratitude & Compliments
  if (lower.match(/\b(thank|thanks|thank u|thankyou|awesome|great|good|nice|perfect|cool)\b/)) {
    return "You're most welcome! 😊 I'm always here if you need styling advice, outfit recommendations, or help with your order. Enjoy exploring J&J Vintage!";
  }

  // 4. Identity & Creator questions
  if (lower.match(/\b(who (made|created|built) you|are you (real|human|ai|bot)|what are you)\b/)) {
    return "I am an AI Personal Fashion Stylist created for J&J Vintage! I'm trained to help you explore luxury fashion, find matching outfits, calculate your exact fit, and answer any shopping questions.";
  }

  // 5. Entertainment & Jokes
  if (lower.match(/\b(joke|funny|laugh|story|tell me something)\b/)) {
    return "Here's a fashion joke for you: Why did the designer handbag go to therapy? Because it was feeling a little 'worn out' from carrying everyone's high expectations! 😄 Is there a specific style or outfit you'd like to check out today?";
  }

  // 6. Shopping & Budget Matching
  let maxBudget = null;
  const budgetMatch = lower.match(/(?:under|below|budget|less than|cedis?|ghc?)\s*(\d+)/i);
  if (budgetMatch) {
    maxBudget = Number(budgetMatch[1]);
  }

  if (maxBudget !== null) {
    return `Here are our top luxury pieces from J&J Vintage matching your budget under GH₵ ${maxBudget}. Tap any piece below to view details, or let me know if you need help finding your exact size!`;
  }

  // 7. Size advice
  if (lower.includes('size') || lower.includes('fit') || lower.includes('measurement')) {
    return "Our J&J Vintage garments feature handcrafted European cuts. For a classic tailored fit, select your standard size. For an oversized, relaxed vintage drape, we recommend ordering one size up! You can also click 'FIND MY EXACT SIZE' on any product page for a custom calculation.";
  } 

  // 8. Shipping / Delivery / Payment / Ghana details
  if (lower.match(/\b(ship|shipping|deliver|delivery|pay|payment|paystack|momo|mobile money)\b/)) {
    return "We offer express tracked delivery across all major cities in Ghana, including Accra, Kumasi, and Takoradi! We accept Mobile Money (MTN, Telecel/Vodafone, AT) and Bank Cards via Paystack, as well as Cash on Delivery.";
  }
  
  if (lower.includes('wedding') || lower.includes('gala') || lower.includes('party') || lower.includes('dinner')) {
    return "For a special occasion like a wedding or gala, you want to make an unforgettable entrance! Here are our finest curated couture pieces for your look. Would you like me to recommend matching shoes or accessories as well?";
  }

  return "I've curated these exquisite luxury pieces from J&J Vintage for you! Tap any item below to view full details, or let me know if you would like me to check available sizes.";
}

// Product Extractor for UI Cards
function extractMatchingProducts(userQuery, products) {
  const lower = userQuery.toLowerCase();

  let maxBudget = null;
  const budgetMatch = lower.match(/(?:under|below|budget|less than|cedis?|ghc?)\s*(\d+)/i);
  if (budgetMatch) {
    maxBudget = Number(budgetMatch[1]);
  }

  let isShoppingQuery = lower.match(/\b(buy|shop|outfit|recommend|wear|price|cost|item|jacket|shoe|dress|sneaker|gown|coat|watch|bag|shirt|pants|men|women|kids?)\b/);

  if (!isShoppingQuery && maxBudget === null) {
    return [];
  }

  let matches = products.filter((p) => {
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
    if (lower.includes('gown') || lower.includes('dress')) return cat.includes('dresses') || title.includes('gown');
    if (lower.includes('watch') || lower.includes('jewelry') || lower.includes('accessory')) return cat.includes('jewelry') || cat.includes('accessories') || title.includes('watch');

    return title.includes(lower) || cat.includes(lower);
  });

  if (matches.length === 0 && isShoppingQuery) {
    matches = products.slice(0, 2);
  }

  return matches.slice(0, 3);
}

// @desc    Process AI Stylist Chat Message via Multi-Engine AI Pipeline
// @route   POST /api/ai/chat
// @access  Public
const chatWithAIAgent = async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const userMessage = message.trim();

    // Fetch live product catalog context
    let products = [];
    try {
      if (Product.db && Product.db.readyState === 1) {
        products = await Product.find({ isArchived: { $ne: true } }).lean();
      }
    } catch (e) {}

    if (!products || products.length === 0) {
      products = initialProducts;
    }

    const catalogSummary = products
      .slice(0, 10)
      .map(
        (p) =>
          `- ${p.title} (Category: ${p.category}, Price: GH₵ ${p.salePrice > 0 ? p.salePrice : p.price})`
      )
      .join('\n');

    const systemPrompt = `You are a concise, highly intelligent AI Assistant for J&J Vintage.

Store Context:
- Store: J&J Vintage (Ghana)
- Currency: Ghanaian Cedis (GH₵ / GHS)
- Payment: Mobile Money (MTN, Telecel/Vodafone, AT), Paystack, Cash on Delivery
- Delivery: Express tracked delivery across Ghana (Accra, Kumasi, Takoradi)
- Sizing: European luxury cuts (true to size, 1 size up for oversized vintage look)

Catalog Context:
${catalogSummary}

Strict Style Guidelines:
1. BE CONCISE & DIRECT: Keep responses brief, crisp, and to the point (1-3 short sentences max). Avoid long rambles or verbose paragraphs.
2. NO REPETITIVE PLEASANTRIES: DO NOT say "I am glad to help", "I'm happy to assist you", "Hello again", or "As an AI" in ongoing chat. Jump straight to the answer!
3. NATURAL & ELEGANT: Write clean, polished, complete sentences.
4. E-COMMERCE ADVICE: If recommending items, mention their exact names and Cedis prices concisely.`;

    let aiReplyText = null;
    let engineUsed = null;

    // ==========================================
    // 🦙 ENGINE 1: Groq Llama 3.3 70B (Primary LLM Engine)
    // ==========================================
    if (process.env.GROQ_API_KEY) {
      try {
        console.log('[AI Pipeline] Calling Primary LLM Engine: Groq Llama 3.3 70B...');
        const groqRes = await axios.post(
          'https://api.groq.com/openai/v1/chat/completions',
          {
            model: 'llama-3.3-70b-versatile',
            messages: [
              { role: 'system', content: systemPrompt },
              ...(history || []).slice(-6).map((h) => ({
                role: h.role === 'user' ? 'user' : 'assistant',
                content: h.content,
              })),
              { role: 'user', content: userMessage },
            ],
            temperature: 0.7,
            max_tokens: 1000,
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
              'Content-Type': 'application/json',
            },
            timeout: 10000,
          }
        );

        const groqText = groqRes.data?.choices?.[0]?.message?.content;
        if (groqText) {
          aiReplyText = groqText;
          engineUsed = 'Groq Llama 3.3 70B';
          console.log('[AI Pipeline] Engine Success: Groq Llama 3.3 70B');
        }
      } catch (err) {
        console.warn('[AI Pipeline] Groq Llama 3 API call failed:', err.response?.data || err.message);
      }
    }

    // ==========================================
    // ⚡ ENGINE 2: Google Gemini AI (Secondary LLM Engine)
    // ==========================================
    if (!aiReplyText && process.env.GEMINI_API_KEY) {
      try {
        console.log('[AI Pipeline] Calling Secondary LLM Engine: Google Gemini AI...');
        const geminiRes = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            contents: [
              {
                role: 'user',
                parts: [{ text: `${systemPrompt}\n\nUser Question: ${userMessage}` }],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1000,
            },
          },
          { timeout: 8000 }
        );

        const geminiText = geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (geminiText) {
          aiReplyText = geminiText;
          engineUsed = 'Google Gemini AI';
          console.log('[AI Pipeline] Engine Success: Google Gemini AI');
        }
      } catch (err) {
        console.warn('[AI Pipeline] Gemini AI call failed:', err.response?.data || err.message);
      }
    }

    // Fallback Engine
    if (!aiReplyText) {
      engineUsed = 'J&J Conversational Engine';
      aiReplyText = generateLocalFallback(userMessage, products);
    }

    const matchingProducts = extractMatchingProducts(userMessage, products);

    return res.json({
      text: aiReplyText,
      engine: engineUsed,
      recommendations: matchingProducts.map((p) => ({
        _id: p._id,
        title: p.title,
        price: `GH₵ ${p.salePrice > 0 ? p.salePrice : p.price}`,
        link: `/product/${p._id}`,
        image: Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : (p.images || p.image),
      })),
    });
  } catch (error) {
    console.error('AI Pipeline Error:', error);
    res.status(500).json({ message: 'AI Agent error' });
  }
};

module.exports = {
  chatWithAIAgent,
};
