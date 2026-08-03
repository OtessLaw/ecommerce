const axios = require('axios');
const Product = require('../models/Product');
const { initialProducts } = require('../utils/seedData');

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

  if (matches.length === 0 && (lower.includes('buy') || lower.includes('shop') || lower.includes('outfit') || lower.includes('recommend') || lower.includes('wear') || lower.includes('price'))) {
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

    const systemPrompt = `You are a fully capable, highly intelligent AI Assistant just like ChatGPT and Gemini.
You have complete general intelligence and can chat fluently about ANY question from ANY angle (e.g. general knowledge, life advice, fashion trends, sports, technology, science, history, storytelling, jokes, math, coding, or casual conversation).

You also represent J&J Vintage (a luxury couture fashion house in Ghana).

Store Context (Use when relevant):
- Store: J&J Vintage
- Currency: Ghanaian Cedis (GH₵ / GHS)
- Payment: Mobile Money (MTN, Telecel/Vodafone, AT), Paystack, Cash on Delivery
- Shipping: Express delivery in Ghana (Accra, Kumasi, Takoradi, etc.)
- Sizing: European luxury cuts (true to size, 1 size up for oversized vintage drape)

Catalog Context:
${catalogSummary}

Core Guidelines:
1. Answer ANY user question directly, warmly, intelligently, and comprehensively from all angles (exactly like ChatGPT and Gemini).
2. If the user asks a fashion, styling, or shopping question, naturally integrate advice and mention J&J Vintage products with prices in GH₵.
3. If the user asks general or non-fashion questions (e.g. greetings, science, advice, stories), answer thoroughly as a brilliant AI assistant.
4. Maintain a warm, friendly, human tone at all times.`;

    let aiReplyText = null;
    let engineUsed = null;

    const groqKey = process.env.GROQ_API_KEY;

    // ==========================================
    // 🦙 ENGINE 1: Groq Llama 3.3 70B (Primary Ultra-Fast)
    // ==========================================
    if (groqKey) {
      try {
        console.log('[AI Pipeline] Calling Primary LLM Engine: Groq Llama 3.3 70B...');
        const groqRes = await axios.post(
          'https://api.groq.com/openai/v1/chat/completions',
          {
            model: 'llama-3.3-70b-versatile',
            messages: [
              { role: 'system', content: systemPrompt },
              ...(history || []).slice(-4).map((h) => ({
                role: h.role === 'user' ? 'user' : 'assistant',
                content: h.content,
              })),
              { role: 'user', content: userMessage },
            ],
            temperature: 0.7,
            max_tokens: 500,
          },
          {
            headers: {
              Authorization: `Bearer ${groqKey}`,
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
        console.warn('[AI Pipeline] Groq Llama 3 failed/timed out.', err.response?.data || err.message);
      }
    }

    // ==========================================
    // 🤖 ENGINE 2: OpenAI GPT (Fallback 1)
    // ==========================================
    if (!aiReplyText && process.env.OPENAI_API_KEY) {
      try {
        console.log('[AI Pipeline] Calling Secondary LLM Engine: OpenAI GPT...');
        const openaiRes = await axios.post(
          'https://api.openai.com/v1,chat/completions',
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
        console.warn('[AI Pipeline] OpenAI GPT failed/timed out.', err.response?.data || err.message);
      }
    }

    // Fallback if network offline
    if (!aiReplyText) {
      engineUsed = 'J&J Local Engine';
      aiReplyText = "Hello! I am your J&J Vintage assistant. How can I help you choose the perfect luxury item today?";
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
