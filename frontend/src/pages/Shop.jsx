import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/product/ProductCard';
import { GridSkeleton } from '../components/common/LoadingSkeleton';
import API from '../services/api';
import { FiFilter, FiX, FiCheck } from 'react-icons/fi';

const categories = ['Men', 'Women', 'Kids', 'Shoes', 'Sneakers', 'Bags', 'Accessories', 'Jewelry', 'Beauty'];
const brands = ['Balmain Paris', 'Saint Laurent', 'Rolex Heritage', 'Gucci Vault', 'Off-White atelier', 'Fear of God'];
const colors = [
  { name: 'Matte Black', hex: '#0B0B0B' },
  { name: 'Gold Onyx', hex: '#D4AF37' },
  { name: 'Pure White', hex: '#FFFFFF' },
  { name: 'Emerald Gold', hex: '#123524' },
];
const sizes = ['S', 'M', 'L', 'XL', '41', '42', '43', '44'];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Active Filter States
  const categoryParam = searchParams.get('category') || '';
  const searchParam = searchParams.get('search') || '';
  const sortParam = searchParams.get('sort') || 'newest';
  const flashSaleParam = searchParams.get('isFlashSale') || '';

  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState(sortParam);
  const [page, setPage] = useState(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    setSelectedCategory(categoryParam);
  }, [categoryParam]);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, selectedBrand, selectedColor, selectedSize, minPrice, maxPrice, sort, page, searchParam, flashSaleParam]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 9,
        sort,
        parentCategory: selectedCategory,
        brand: selectedBrand,
        color: selectedColor,
        size: selectedSize,
        minPrice,
        maxPrice,
        search: searchParam,
        isFlashSale: flashSaleParam,
      };

      const { data } = await API.get('/products', { params });
      setProducts(data.products || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch (error) {
      console.error('Error fetching shop products', error);
    } finally {
      setLoading(false);
    }
  };

  const clearAllFilters = () => {
    setSelectedCategory('');
    setSelectedBrand('');
    setSelectedColor('');
    setSelectedSize('');
    setMinPrice('');
    setMaxPrice('');
    setSort('newest');
    setPage(1);
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Title */}
      <div className="border-b border-[#2A2A2A] pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <span className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest">ATELIER CATALOGUE</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white uppercase tracking-tight mt-1">
            LUXURY <span className="gold-gradient-text">COUTURE & FOOTWEAR</span>
          </h1>
          {searchParam && <p className="text-xs text-gray-400 mt-1">Search results for: "{searchParam}"</p>}
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-end">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden bg-[#141414] border border-[#2A2A2A] text-white text-xs px-4 py-2.5 rounded-xl font-bold flex items-center space-x-2"
          >
            <FiFilter size={14} />
            <span>FILTERS</span>
          </button>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-400 hidden sm:inline">SORT BY:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-[#141414] border border-[#2A2A2A] text-white text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#D4AF37]"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <aside className="hidden lg:block space-y-6 bg-[#141414] p-6 rounded-2xl border border-[#2A2A2A] h-fit">
          <div className="flex justify-between items-center border-b border-[#2A2A2A] pb-4">
            <h3 className="text-xs font-extrabold text-white uppercase tracking-widest">FILTER PRODUCTS</h3>
            <button onClick={clearAllFilters} className="text-[11px] text-[#D4AF37] hover:underline font-bold">
              CLEAR ALL
            </button>
          </div>

          {/* Department Category */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-gray-300 uppercase">Department</h4>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedCategory('')}
                className={`block w-full text-left text-xs py-1 px-2 rounded ${
                  selectedCategory === '' ? 'bg-[#D4AF37] text-black font-bold' : 'text-gray-400 hover:text-white'
                }`}
              >
                All Departments
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`block w-full text-left text-xs py-1 px-2 rounded ${
                    selectedCategory === cat ? 'bg-[#D4AF37] text-black font-bold' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Brands */}
          <div className="space-y-2 pt-4 border-t border-[#2A2A2A]">
            <h4 className="text-xs font-bold text-gray-300 uppercase">Brand</h4>
            <div className="space-y-1">
              {brands.map((b) => (
                <label key={b} className="flex items-center space-x-2 text-xs text-gray-400 cursor-pointer hover:text-white">
                  <input
                    type="checkbox"
                    checked={selectedBrand === b}
                    onChange={() => setSelectedBrand(selectedBrand === b ? '' : b)}
                    className="accent-[#D4AF37]"
                  />
                  <span>{b}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-2 pt-4 border-t border-[#2A2A2A]">
            <h4 className="text-xs font-bold text-gray-300 uppercase">Price Range (₦)</h4>
            <div className="flex space-x-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-1/2 bg-[#1A1A1A] text-white text-xs rounded-lg p-2 border border-[#2A2A2A]"
              />
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-1/2 bg-[#1A1A1A] text-white text-xs rounded-lg p-2 border border-[#2A2A2A]"
              />
            </div>
          </div>

          {/* Sizes */}
          <div className="space-y-2 pt-4 border-t border-[#2A2A2A]">
            <h4 className="text-xs font-bold text-gray-300 uppercase">Size</h4>
            <div className="grid grid-cols-4 gap-2">
              {sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(selectedSize === s ? '' : s)}
                  className={`py-1.5 text-xs font-bold rounded-lg border ${
                    selectedSize === s
                      ? 'bg-[#D4AF37] text-black border-[#D4AF37]'
                      : 'border-[#2A2A2A] text-gray-400 hover:border-white'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Product Grid */}
        <main className="lg:col-span-3 space-y-8">
          {loading ? (
            <GridSkeleton count={6} />
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-[#141414] rounded-2xl border border-[#2A2A2A] space-y-4">
              <p className="text-gray-400 text-sm">No luxury products match your selected filters.</p>
              <button
                onClick={clearAllFilters}
                className="gold-btn px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider"
              >
                RESET FILTERS
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>

              {/* Pagination */}
              {pages > 1 && (
                <div className="flex justify-center space-x-2 pt-6">
                  {Array.from({ length: pages }).map((_, idx) => {
                    const pageNum = idx + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-10 h-10 rounded-xl text-xs font-bold border ${
                          page === pageNum
                            ? 'bg-[#D4AF37] text-black border-[#D4AF37]'
                            : 'bg-[#141414] text-white border-[#2A2A2A] hover:border-[#D4AF37]'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
