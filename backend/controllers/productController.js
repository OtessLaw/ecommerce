const Product = require('../models/Product');
const { initialProducts } = require('../utils/seedData');

// @desc    Get all products with filtering, search, sorting & pagination
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const {
      search,
      parentCategory,
      category,
      brand,
      minPrice,
      maxPrice,
      color,
      size,
      rating,
      inStock,
      isFeatured,
      isNewArrival,
      isTrending,
      isFlashSale,
      sort,
      page = 1,
      limit = 12,
    } = req.query;

    if (Product.db && Product.db.readyState === 1) {
      let query = {};

      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { brand: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } },
        ];
      }

      if (parentCategory || category) {
        const catTerm = (parentCategory || category).trim();
        const catRegex = new RegExp(catTerm, 'i');
        query.$or = [
          { parentCategory: catRegex },
          { category: catRegex },
          { tags: catRegex },
          { title: catRegex },
        ];
      }

      if (brand) query.brand = new RegExp(brand, 'i');
      if (isFeatured === 'true') query.isFeatured = true;
      if (isNewArrival === 'true') query.isNewArrival = true;
      if (isTrending === 'true') query.isTrending = true;
      if (isFlashSale === 'true') query.isFlashSale = true;

      if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
      }

      if (rating) query.rating = { $gte: Number(rating) };
      if (inStock === 'true') query.stock = { $gt: 0 };
      if (color) query['colors.name'] = new RegExp(color, 'i');
      if (size) query.sizes = size;

      let sortOptions = {};
      if (sort === 'price_low') sortOptions.price = 1;
      else if (sort === 'price_high') sortOptions.price = -1;
      else if (sort === 'rating') sortOptions.rating = -1;
      else if (sort === 'popular') sortOptions.numReviews = -1;
      else sortOptions.createdAt = -1; // Newest default

      const count = await Product.countDocuments(query);
      const products = await Product.find(query)
        .sort(sortOptions)
        .limit(Number(limit))
        .skip(Number(limit) * (Number(page) - 1));

      return res.json({
        products,
        page: Number(page),
        pages: Math.ceil(count / Number(limit)),
        total: count,
      });
    }

    // Hybrid In-Memory Fallback for standalone preview
    let filtered = [...initialProducts];

    if (search) {
      const term = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term) ||
          p.brand.toLowerCase().includes(term) ||
          p.category.toLowerCase().includes(term)
      );
    }

    if (parentCategory || category) {
      const target = (parentCategory || category).toLowerCase();
      const matched = filtered.filter(
        (p) =>
          p.parentCategory?.toLowerCase().includes(target) ||
          p.category?.toLowerCase().includes(target) ||
          p.tags?.some((t) => t.toLowerCase().includes(target)) ||
          p.title?.toLowerCase().includes(target)
      );
      if (matched.length > 0) {
        filtered = matched;
      }
    }

    if (brand) {
      const bTarget = brand.toLowerCase();
      const bMatched = filtered.filter((p) => p.brand.toLowerCase().includes(bTarget));
      if (bMatched.length > 0) filtered = bMatched;
    }

    if (isFeatured === 'true') filtered = filtered.filter((p) => p.isFeatured);
    if (isNewArrival === 'true') filtered = filtered.filter((p) => p.isNewArrival);
    if (isTrending === 'true') filtered = filtered.filter((p) => p.isTrending);
    if (isFlashSale === 'true') filtered = filtered.filter((p) => p.isFlashSale);

    if (minPrice) filtered = filtered.filter((p) => (p.salePrice || p.price) >= Number(minPrice));
    if (maxPrice) filtered = filtered.filter((p) => (p.salePrice || p.price) <= Number(maxPrice));
    if (rating) filtered = filtered.filter((p) => p.rating >= Number(rating));
    if (inStock === 'true') filtered = filtered.filter((p) => p.stock > 0);

    if (color) filtered = filtered.filter((p) => p.colors?.some((c) => c.name.toLowerCase() === color.toLowerCase()));
    if (size) filtered = filtered.filter((p) => p.sizes?.includes(size));

    // Sort
    if (sort === 'price_low') filtered.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
    else if (sort === 'price_high') filtered.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
    else if (sort === 'rating') filtered.sort((a, b) => b.rating - a.rating);
    else if (sort === 'popular') filtered.sort((a, b) => b.numReviews - a.numReviews);

    const total = filtered.length;
    const startIndex = (Number(page) - 1) * Number(limit);
    const paginated = filtered.slice(startIndex, startIndex + Number(limit));

    res.json({
      products: paginated,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)) || 1,
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single product by ID or Slug
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    if (Product.db && Product.db.readyState === 1) {
      const product = await Product.findById(req.params.id);
      if (product) return res.json(product);
    }

    const found = initialProducts.find((p) => p._id === req.params.id || p.slug === req.params.id);
    if (found) return res.json(found);

    res.status(404).json({ message: 'Product not found' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create product (Admin / Staff)
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    const { title, price, description, images, category, parentCategory, stock, sizes, colors, brand } = req.body;

    const sku = `${brand?.substring(0, 3).toUpperCase() || 'LUX'}-${Math.floor(1000 + Math.random() * 9000)}`;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    if (Product.db && Product.db.readyState === 1) {
      const product = await Product.create({
        title,
        slug,
        sku,
        price,
        description,
        images: images && images.length ? images : ['https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80'],
        category,
        parentCategory,
        stock,
        sizes,
        colors,
        brand,
      });
      return res.status(201).json(product);
    }

    const newProd = {
      _id: `prod_${Date.now()}`,
      title,
      slug,
      sku,
      price: Number(price),
      salePrice: 0,
      description,
      images: images && images.length ? images : ['https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80'],
      category: category || 'Clothing',
      parentCategory: parentCategory || 'Men',
      stock: Number(stock) || 10,
      sizes: sizes || ['S', 'M', 'L', 'XL'],
      colors: colors || [{ name: 'Black', hex: '#000000' }],
      brand: brand || 'Antigravity Atelier',
      rating: 5.0,
      numReviews: 1,
      isFeatured: true,
      isNewArrival: true,
    };
    initialProducts.unshift(newProd);

    res.status(201).json(newProd);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  try {
    if (Product.db && Product.db.readyState === 1) {
      const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (product) return res.json(product);
    }

    const index = initialProducts.findIndex((p) => p._id === req.params.id);
    if (index !== -1) {
      initialProducts[index] = { ...initialProducts[index], ...req.body };
      return res.json(initialProducts[index]);
    }

    res.status(404).json({ message: 'Product not found' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    if (Product.db && Product.db.readyState === 1) {
      await Product.findByIdAndDelete(req.params.id);
      return res.json({ message: 'Product removed' });
    }

    const index = initialProducts.findIndex((p) => p._id === req.params.id);
    if (index !== -1) {
      initialProducts.splice(index, 1);
      return res.json({ message: 'Product removed' });
    }

    res.status(404).json({ message: 'Product not found' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
