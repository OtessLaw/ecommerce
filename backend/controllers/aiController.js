const Product = require('../models/Product');
const { initialProducts } = require('../utils/seedData');

// @desc    Process AI Stylist Chat Message
// @route   POST /api/ai/chat
// @access  Public
const chatWithAIAgent = async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'User message is required' });
    }

    const userQuery = message.trim();
    const lower = userQuery.toLowerCase();

    // 1. Fetch live product catalog
    let products = [];
    try {
      if (Product.db && Product.db.readyState === 1) {
        products = await Product.find({ isArchived: { $ne: true } }).lean();
      }
    } catch (e) {}

    if (!products || products.length === 0) {
      products = initialProducts;
    }

    // 2. Perform intelligent AI matching & natural response creation
    let textReply = "";
    let recommendedProducts = [];

    // Greetings
    if (lower.match(/\b(hi|hello|hey|greetings|good morning|good afternoon|good evening|who are you)\b/)) {
      textReply = "Hello! 👋 I am your J&J Vintage AI Fashion Stylist. I am here to help you select the perfect luxury outfit, find your exact size, or answer any questions about our collection. What occasion are you shopping for today?";
    } 
    // Size guidance
    else if (lower.includes('size') || lower.includes('fit') || lower.includes('measurement')) {
      textReply = "Our J&J Vintage garments feature handcrafted European cuts. For a tailored fit, select your true size. If you prefer a relaxed vintage drape, we recommend ordering one size up! You can also use our interactive 'FIND MY EXACT SIZE' calculator on any product page.";
    } 
    // Shipping / Payment / Ghana details
    else if (lower.match(/\b(ship|shipping|deliver|delivery|pay|payment|paystack|momo|mobile money|cedi|cedis|ghc)\b/)) {
      textReply = "We deliver across all cities in Ghana! We accept Mobile Money (MTN, Telecel/Vodafone, AT) and Bank Cards securely via Paystack, as well as Cash on Delivery.";
      recommendedProducts = products.slice(0, 2);
    } 
    // Catalog product search by keyword, category, budget
    else {
      let maxBudget = null;
      const budgetMatch = lower.match(/(?:under|below|budget|less than|cedis?|ghc?)\s*(\d+)/i);
      if (budgetMatch) {
        maxBudget = Number(budgetMatch[1]);
      }

      let matches = products.filter(p => {
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
        textReply = `I've put together these magnificent luxury pieces from our J&J Vintage collection for you. They pair effortlessly for a statement look:`;
      } else if (maxBudget !== null) {
        textReply = `Here are our finest pieces from J&J Vintage matching your budget of GH₵ ${maxBudget}:`;
      } else if (lower.includes('wedding') || lower.includes('gala') || lower.includes('party') || lower.includes('dinner')) {
        textReply = `For an occasion like that, you want an unforgettable presence! Here is the curated outfit combination I recommend:`;
      } else {
        textReply = `I found these curated items matching your request. Click any item below to view full details:`;
      }

      recommendedProducts = matches.slice(0, 3);
    }

    return res.json({
      text: textReply,
      recommendations: recommendedProducts.map(p => ({
        _id: p._id,
        title: p.title,
        price: `GH₵ ${p.salePrice > 0 ? p.salePrice : p.price}`,
        link: `/product/${p._id}`,
        image: Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : (p.images || p.image)
      }))
    });

  } catch (error) {
    console.error('AI Agent Error:', error);
    res.status(500).json({ message: 'AI Agent server error' });
  }
};

module.exports = {
  chatWithAIAgent,
};
