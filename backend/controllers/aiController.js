const axios = require('axios');
const Product = require('../models/Product');
const { initialProducts } = require('../utils/seedData');

// Local Fallback Matcher
function generateLocalFallback(userQuery, products) {
  const lower = userQuery.toLowerCase();

  if (lower.match(/\b(hi|hello|hey|greetings|good morning|good afternoon|good evening|who are you)\b/)) {
    return "Hello darling! 👋 I am your J&J Vintage AI Fashion Stylist. I am here to help you select the perfect luxury outfit, find your exact size, or answer any questions about our collection. What occasion are you shopping for today?";
  } 
  if (lower.includes('size') || lower.includes('fit') || lower.includes('measurement')) {
    return "Our J&J Vintage garments feature handcrafted European cuts. For a tailored fit, select your true size. If you prefer a relaxed vintage drape, we recommend ordering one size up! You can also use our interactive 'FIND MY EXACT SIZE' calculator on any product page.";
  } 
  if (lower.match(/\b(ship|shipping|deliver|delivery|pay|payment|paystack|momo|mobile money|cedi|cedis|ghc)\b/)) {
    return "We offer express tracked delivery across all cities in Ghana! We accept Mobile Money (MTN, Telecel/Vodafone, AT) and Bank Cards securely via Paystack, as well as Cash on Delivery.";
  }

  let maxBudget = null;
  const budgetMatch = lower.match(/(?:under|below|budget|less than|cedis?|ghc?)\s*(\d+)/i);
  if (budgetMatch) {
    maxBudget = Number(budgetMatch[1]);
  }

  if (maxBudget !== null) {
    return `Here are our finest luxury pieces from J&J Vintage matching your budget of GH₵ ${maxBudget}:`;
  } else if (lower.includes('wedding') || lower.includes('gala') || lower.includes('party') || lower.includes('dinner')) {
    return `For an event like that, you want to make an unforgettable entrance! Here is the curated outfit combination I recommend:`;
  }

  return "I've selected these magnificent luxury pieces from our J&J Vintage collection just for you:";
}

// Product Extractor for UI Cards
function extractMatchingProducts(userQuery, products) {
  const lower = userQuery.toLowerCase();

  let maxBudget = null;
  const budgetMatch = lower.match(/(?:under|below|budget|less than|cedis?|ghc?)\s*(\d+)/i);
  if (budgetMatch) {
    maxBudget = Number(budgetMatch[1]);
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

  if (matches.length === 0) {
    matches = products.slice(0, 3);
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

    const systemPrompt = `You are the AI Personal Fashion Stylist & Concierge for J&J Vintage, an ultra-luxury fashion house based in Ghana.
You assist clients warmly, eloquently, and knowledgeably with outfit recommendations, styling for events, sizing advice, and store inquiries.

Business Knowledge:
- Store Name: J&J Vintage
- Currency: Ghanaian Cedis (GH₵ / GHS)
- Payment Gateways: Mobile Money (MTN, Telecel/Vodafone, AT), Bank Cards via Paystack, Cash on Delivery
- Shipping: Express tracked delivery across all cities in Ghana (Accra, Kumasi, Takoradi, etc.)
- Sizing: European luxury cuts. True to size for tailored look, 1 size up for oversized vintage look.

Current Live Catalog Highlights:
${catalogSummary}

Guidelines:
- Keep answers concise, elegant, warm, and helpful (under 3 paragraphs).
- If recommending products, mention their exact names and Cedis prices.
- Never mention internal technical details or fallback engines.`;

    let aiReplyText = null;
    let engineUsed = null;

    // ==========================================
    // ⚡ ENGINE 1: Google Gemini AI (Primary)
    // ==========================================
    if (process.env.GEMINI_API_KEY) {
      try {
        console.log('[AI Pipeline] Calling Primary Engine: Google Gemini AI...');
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
              maxOutputTokens: 500,
            },
          },
          {
            headers: {
              'x-goog-api-key': process.env.GEMINI_API_KEY,
              'Content-Type': 'application/json',
            },
            timeout: 8000,
          }
        );

        const geminiText = geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (geminiText) {
          aiReplyText = geminiText;
          engineUsed = 'Google Gemini AI';
          console.log('[AI Pipeline] Engine Success: Google Gemini AI');
        }
      } catch (err) {
        console.warn('[AI Pipeline] Gemini AI failed/timed out. Failing over to Groq Llama 3...', err.response?.data || err.message);
      }
    }

    // ==========================================
    // 🦙 ENGINE 2: Groq Llama 3 (Secondary Fallback)
    // ==========================================
    if (!aiReplyText && process.env.GROQ_API_KEY) {
      try {
        console.log('[AI Pipeline] Calling Secondary Engine: Groq Llama 3...');
        const groqRes = await axios.post(
          'https://api.groq.com/openai/v1/chat/completions',
          {
            model: 'llama-3.3-70b-versatile',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userMessage },
            ],
            temperature: 0.7,
            max_tokens: 500,
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
              'Content-Type': 'application/json',
            },
            timeout: 8000,
          }
        );

        const groqText = groqRes.data?.choices?.[0]?.message?.content;
        if (groqText) {
          aiReplyText = groqText;
          engineUsed = 'Groq Llama 3.3 70B';
          console.log('[AI Pipeline] Engine Success: Groq Llama 3');
        }
      } catch (err) {
        console.warn('[AI Pipeline] Groq Llama 3 failed/timed out. Failing over to OpenAI GPT...', err.response?.data || err.message);
      }
    }

    // ==========================================
    // 🤖 ENGINE 3: OpenAI GPT-3.5 (Tertiary Fallback)
    // ==========================================
    if (!aiReplyText && process.env.OPENAI_API_KEY) {
      try {
        console.log('[AI Pipeline] Calling Tertiary Engine: OpenAI GPT...');
        const openaiRes = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userMessage },
            ],
            temperature: 0.7,
            max_tokens: 500,
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
              'Content-Type': 'application/json',
            },
            timeout: 8000,
          }
        );

        const openaiText = openaiRes.data?.choices?.[0]?.message?.content;
        if (openaiText) {
          aiReplyText = openaiText;
          engineUsed = 'OpenAI GPT-3.5';
          console.log('[AI Pipeline] Engine Success: OpenAI GPT');
        }
      } catch (err) {
        console.warn('[AI Pipeline] OpenAI GPT failed/timed out. Falling over to Local Rule Engine...', err.message);
      }
    }

    // ==========================================
    // 🏢 ENGINE 4: Local Rule Engine (Quaternary Fallback)
    // ==========================================
    if (!aiReplyText) {
      engineUsed = 'J&J Local Rule Engine';
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
