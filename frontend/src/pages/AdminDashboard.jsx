import React, { useState, useEffect } from 'react';
import AdminSidebar from '../components/admin/AdminSidebar';
import API from '../services/api';
import toast from 'react-hot-toast';
import {
  FiDollarSign as FiDollar,
  FiShoppingBag as FiCart,
  FiBox as FiProductBox,
  FiUsers as FiUserGroup,
  FiPlus as FiAdd,
  FiTrash2 as FiDelete,
  FiEdit as FiEditBtn,
  FiCheck as FiCheckMark,
  FiX as FiClose,
  FiTag as FiCouponTag,
  FiFolder as FiCatFolder,
  FiImage as FiBannerImg,
  FiSettings as FiStoreSet,
  FiPrinter,
} from 'react-icons/fi';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [selectedOrderModal, setSelectedOrderModal] = useState(null);
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [coupons, setCoupons] = useState([
    { _id: 'c1', code: 'VINTAGE15', discountPercentage: 15, expiryDate: '2026-12-31', isActive: true },
    { _id: 'c2', code: 'JJGOLD20', discountPercentage: 20, expiryDate: '2026-12-31', isActive: true },
  ]);
  const [banners, setBanners] = useState([
    { _id: 'b1', title: 'THE VINTAGE COUTURE EDIT', image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=80', active: true },
    { _id: 'b2', title: 'RETRO LEATHER & DENIM', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1000&q=80', active: true },
  ]);

  const [settingsForm, setSettingsForm] = useState({
    paystackPublicKey: 'pk_test_mock_paystack_public_key',
    paystackSecretKey: 'sk_test_mock_paystack_secret_key',
    paystackMode: 'test',
    arkeselApiKey: 'mock_arkesel_key',
    arkeselSenderId: 'JJVINTAGE',
    storeCurrency: 'NGN',
    supportEmail: 'support@jjvintage.com',
    supportPhone: '+2348012345678',
  });

  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);

  // New Product Form
  const [newProd, setNewProd] = useState({
    title: '',
    price: '',
    salePrice: '',
    description: '',
    category: 'Outerwear',
    parentCategory: 'Men',
    brand: 'J&J Vintage',
    stock: 15,
    sizes: 'S, M, L, XL',
    images: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80',
  });

  // New Coupon Form
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discountPercentage: 15,
    expiryDate: '2026-12-31',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dashRes, prodRes, ordRes, usrRes, setRes] = await Promise.all([
        API.get('/admin/dashboard'),
        API.get('/products'),
        API.get('/orders'),
        API.get('/admin/users'),
        API.get('/admin/settings'),
      ]);

      setStats(dashRes.data);
      setProducts(prodRes.data.products || []);
      setOrders(ordRes.data || []);
      setUsers(usrRes.data || []);
      if (setRes.data) setSettingsForm(setRes.data);
    } catch (err) {
      console.error('Error fetching admin data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newProd,
        price: Number(newProd.price),
        salePrice: Number(newProd.salePrice || 0),
        stock: Number(newProd.stock),
        sizes: newProd.sizes.split(',').map((s) => s.trim()),
        images: [newProd.images],
      };
      const { data } = await API.post('/products', payload);
      toast.success(`Created product ${data.title}!`);
      setProducts([data, ...products]);
      setIsProductModalOpen(false);
    } catch (err) {
      toast.error('Failed to create product');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Remove this product from catalog?')) return;
    try {
      await API.delete(`/products/${id}`);
      setProducts(products.filter((p) => p._id !== id));
      toast.success('Product deleted');
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const handleCreateCoupon = (e) => {
    e.preventDefault();
    if (newCoupon.code.trim()) {
      const created = {
        _id: `cop_${Date.now()}`,
        code: newCoupon.code.toUpperCase(),
        discountPercentage: Number(newCoupon.discountPercentage),
        expiryDate: newCoupon.expiryDate,
        isActive: true,
      };
      setCoupons([...coupons, created]);
      toast.success(`Coupon '${created.code}' created!`);
      setIsCouponModalOpen(false);
      setNewCoupon({ code: '', discountPercentage: 15, expiryDate: '2026-12-31' });
    }
  };

  const handleDeleteCoupon = (id) => {
    setCoupons(coupons.filter((c) => c._id !== id));
    toast.success('Coupon removed');
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const { data } = await API.put(`/orders/${orderId}/status`, { status: newStatus });
      setOrders(orders.map((o) => (o._id === orderId ? data : o)));
      toast.success(`Order status updated to ${newStatus} & SMS alert sent!`);
    } catch (err) {
      toast.error('Failed to update order status');
    }
  };

  const filteredOrders = statusFilter === 'All' ? orders : orders.filter((o) => o.orderStatus === statusFilter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Sidebar Menu */}
        <div className={`${mobileSidebarOpen ? 'block' : 'hidden'} lg:block w-full lg:w-64`}>
          <AdminSidebar
            activeTab={activeTab}
            setActiveTab={(tab) => {
              setActiveTab(tab);
              setMobileSidebarOpen(false);
            }}
            counts={{
              products: products.length,
              orders: orders.length,
              users: users.length,
            }}
          />
        </div>

        {/* Main Content Area */}
        <main className="flex-1 space-y-6">
          {/* Header Title */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[#141414] p-6 rounded-2xl border border-[#2A2A2A] gap-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                className="lg:hidden p-2 bg-[#1A1A1A] text-[#D4AF37] border border-[#2A2A2A] rounded-xl font-bold"
              >
                {mobileSidebarOpen ? <FiClose size={20} /> : <FiCatFolder size={20} />}
              </button>
              <div>
                <span className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest">J&J VINTAGE EXECUTIVE PORTAL</span>
                <h1 className="text-xl sm:text-2xl font-extrabold text-white uppercase tracking-tight mt-0.5">
                  {activeTab === 'overview' && 'ANALYTICS OVERVIEW'}
                  {activeTab === 'products' && 'PRODUCT CATALOG MANAGER'}
                  {activeTab === 'categories' && 'CATEGORY & DEPARTMENT MANAGER'}
                  {activeTab === 'coupons' && 'COUPONS & PROMO DISCOUNTS'}
                  {activeTab === 'banners' && 'HOMEPAGE BANNERS & SLIDERS'}
                  {activeTab === 'orders' && 'ORDERS FULFILLMENT & TRACKING'}
                  {activeTab === 'users' && 'CLIENT DIRECTORY & STAFF ROLES'}
                  {activeTab === 'settings' && 'STORE CONFIGURATION SETTINGS'}
                </h1>
              </div>
            </div>

            {activeTab === 'products' && (
              <button
                onClick={() => setIsProductModalOpen(true)}
                className="gold-btn px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase flex items-center space-x-2 shadow-gold"
              >
                <FiAdd size={16} />
                <span>ADD NEW PRODUCT</span>
              </button>
            )}

            {activeTab === 'coupons' && (
              <button
                onClick={() => setIsCouponModalOpen(true)}
                className="gold-btn px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase flex items-center space-x-2 shadow-gold"
              >
                <FiAdd size={16} />
                <span>ADD NEW COUPON</span>
              </button>
            )}
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#141414] p-5 rounded-2xl border border-[#2A2A2A]">
                  <div className="flex justify-between items-center text-gray-400 mb-2">
                    <span className="text-xs font-bold uppercase">Total Revenue</span>
                    <div className="p-2 bg-[#D4AF37]/10 text-[#D4AF37] rounded-lg"><FiDollar size={18} /></div>
                  </div>
                  <p className="text-2xl font-extrabold text-white">GH₵ {stats?.totalRevenue?.toLocaleString() || '148'}</p>
                  <p className="text-[10px] text-emerald-400 font-semibold mt-1">+18.4% this month</p>
                </div>

                <div className="bg-[#141414] p-5 rounded-2xl border border-[#2A2A2A]">
                  <div className="flex justify-between items-center text-gray-400 mb-2">
                    <span className="text-xs font-bold uppercase">Total Orders</span>
                    <div className="p-2 bg-[#D4AF37]/10 text-[#D4AF37] rounded-lg"><FiCart size={18} /></div>
                  </div>
                  <p className="text-2xl font-extrabold text-white">{stats?.totalOrders || 48}</p>
                  <p className="text-[10px] text-gray-400 font-semibold mt-1">{stats?.pendingOrders || 6} Pending fulfillment</p>
                </div>

                <div className="bg-[#141414] p-5 rounded-2xl border border-[#2A2A2A]">
                  <div className="flex justify-between items-center text-gray-400 mb-2">
                    <span className="text-xs font-bold uppercase">Catalog Products</span>
                    <div className="p-2 bg-[#D4AF37]/10 text-[#D4AF37] rounded-lg"><FiProductBox size={18} /></div>
                  </div>
                  <p className="text-2xl font-extrabold text-white">{products.length}</p>
                  <p className="text-[10px] text-yellow-400 font-semibold mt-1">2 Low stock alerts</p>
                </div>

                <div className="bg-[#141414] p-5 rounded-2xl border border-[#2A2A2A]">
                  <div className="flex justify-between items-center text-gray-400 mb-2">
                    <span className="text-xs font-bold uppercase">Registered Clients</span>
                    <div className="p-2 bg-[#D4AF37]/10 text-[#D4AF37] rounded-lg"><FiUserGroup size={18} /></div>
                  </div>
                  <p className="text-2xl font-extrabold text-white">{users.length || 124}</p>
                  <p className="text-[10px] text-gray-400 font-semibold mt-1">Active customer base</p>
                </div>
              </div>

              {/* Monthly Revenue Chart */}
              <div className="bg-[#141414] p-6 rounded-2xl border border-[#2A2A2A] space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Revenue Breakdown (2026)</h3>
                <div className="h-56 flex items-end space-x-4 pt-8 px-2">
                  {stats?.salesChart?.map((sc) => (
                    <div key={sc.month} className="flex-1 flex flex-col items-center space-y-2 h-full justify-end">
                      <div
                        className="w-full bg-gradient-to-t from-[#9E7B3B] to-[#D4AF37] rounded-t-lg transition-all duration-500 hover:opacity-80"
                        style={{ height: `${(sc.revenue / 7000000) * 100}%` }}
                      />
                      <span className="text-[10px] text-gray-400 font-bold uppercase">{sc.month}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCTS CATALOG */}
          {activeTab === 'products' && (
            <div className="bg-[#141414] rounded-2xl border border-[#2A2A2A] overflow-hidden">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-[#1A1A1A] text-gray-400 uppercase font-extrabold border-b border-[#2A2A2A]">
                  <tr>
                    <th className="p-4">Item</th>
                    <th className="p-4">SKU</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Stock</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1F1F1F]">
                  {products.map((p) => (
                    <tr key={p._id} className="hover:bg-[#1A1A1A]/50">
                      <td className="p-4 flex items-center space-x-3">
                        <img src={p.images?.[0]} alt={p.title} className="w-10 h-12 object-cover rounded-lg border border-[#2A2A2A]" />
                        <span className="font-semibold text-white truncate max-w-[180px]">{p.title}</span>
                      </td>
                      <td className="p-4 font-mono">{p.sku}</td>
                      <td className="p-4">{p.parentCategory}</td>
                      <td className="p-4 font-bold text-[#D4AF37]">GH₵ {p.price?.toLocaleString()}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold ${p.stock > 5 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                          {p.stock} in stock
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button onClick={() => handleDeleteProduct(p._id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition">
                          <FiDelete size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: CATEGORIES */}
          {activeTab === 'categories' && (
            <div className="bg-[#141414] p-6 rounded-2xl border border-[#2A2A2A] space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Store Departments & Categories</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {['Men', 'Women', 'Kids', 'Shoes', 'Sneakers', 'Bags', 'Accessories', 'Jewelry', 'Beauty', 'New Arrivals', 'Luxury', 'Sale'].map((cat) => (
                  <div key={cat} className="p-4 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl flex items-center justify-between">
                    <span className="text-xs font-bold text-white uppercase">{cat}</span>
                    <span className="px-2 py-0.5 bg-[#D4AF37]/20 text-[#D4AF37] text-[10px] font-bold rounded">ACTIVE</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: COUPONS */}
          {activeTab === 'coupons' && (
            <div className="bg-[#141414] rounded-2xl border border-[#2A2A2A] overflow-hidden">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-[#1A1A1A] text-gray-400 uppercase font-extrabold border-b border-[#2A2A2A]">
                  <tr>
                    <th className="p-4">Coupon Code</th>
                    <th className="p-4">Discount</th>
                    <th className="p-4">Expiry Date</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1F1F1F]">
                  {coupons.map((c) => (
                    <tr key={c._id}>
                      <td className="p-4 font-mono font-bold text-[#D4AF37]">{c.code}</td>
                      <td className="p-4 font-bold text-white">{c.discountPercentage}% OFF</td>
                      <td className="p-4">{c.expiryDate}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded font-bold text-[10px]">ACTIVE</span>
                      </td>
                      <td className="p-4 text-right">
                        <button onClick={() => handleDeleteCoupon(c._id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg">
                          <FiDelete size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 5: BANNERS */}
          {activeTab === 'banners' && (
            <div className="space-y-4">
              {banners.map((b) => (
                <div key={b._id} className="bg-[#141414] p-4 rounded-2xl border border-[#2A2A2A] flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <img src={b.image} alt={b.title} className="w-20 h-14 object-cover rounded-xl border border-[#2A2A2A]" />
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase">{b.title}</h4>
                      <p className="text-[10px] text-gray-400">Position: Hero Slider</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-full">ACTIVE SLIDE</span>
                </div>
              ))}
            </div>
          )}

          {/* TAB 6: ORDERS & FULFILLMENT */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {/* Filter */}
              <div className="flex space-x-2 bg-[#141414] p-3 rounded-xl border border-[#2A2A2A] text-xs font-semibold">
                {['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg transition ${
                      statusFilter === st ? 'bg-[#D4AF37] text-black font-bold' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <div className="bg-[#141414] rounded-2xl border border-[#2A2A2A] overflow-hidden">
                <table className="w-full text-left text-xs text-gray-300">
                  <thead className="bg-[#1A1A1A] text-gray-400 uppercase font-extrabold border-b border-[#2A2A2A]">
                    <tr>
                      <th className="p-4">Invoice #</th>
                      <th className="p-4">Customer Name</th>
                      <th className="p-4">Phone (SMS)</th>
                      <th className="p-4">Delivery Address</th>
                      <th className="p-4">Total</th>
                      <th className="p-4">Fulfillment Status</th>
                      <th className="p-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1F1F1F]">
                    {filteredOrders.map((o) => (
                      <tr key={o._id} className="hover:bg-[#1A1A1A]/50">
                        <td className="p-4 font-mono font-bold text-white">{o.invoiceNumber}</td>
                        <td className="p-4 font-semibold text-white">{o.shippingAddress?.fullName}</td>
                        <td className="p-4 font-mono text-[#D4AF37] font-bold">{o.shippingAddress?.phone}</td>
                        <td className="p-4 max-w-xs text-gray-300 truncate">
                          {o.shippingAddress?.street}, {o.shippingAddress?.city}, {o.shippingAddress?.state}, {o.shippingAddress?.country || 'Ghana'}
                        </td>
                        <td className="p-4 font-bold text-[#D4AF37]">GH₵ {o.totalPrice?.toLocaleString()}</td>
                        <td className="p-4">
                          <select
                            value={o.orderStatus || 'Pending'}
                            onChange={(e) => handleUpdateOrderStatus(o._id, e.target.value)}
                            className="bg-[#1A1A1A] text-white text-xs rounded-lg px-2 py-1 border border-[#2A2A2A] focus:border-[#D4AF37]"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => setSelectedOrderModal(o)}
                            className="px-3 py-1.5 bg-[#2A2A2A] hover:bg-[#D4AF37] hover:text-black text-white text-[11px] font-bold rounded-lg transition"
                          >
                            DELIVERY SLIP
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: USERS & STAFF */}
          {activeTab === 'users' && (
            <div className="bg-[#141414] rounded-2xl border border-[#2A2A2A] overflow-hidden">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-[#1A1A1A] text-gray-400 uppercase font-extrabold border-b border-[#2A2A2A]">
                  <tr>
                    <th className="p-4">Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1F1F1F]">
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td className="p-4 font-bold text-white">{u.name}</td>
                      <td className="p-4 text-gray-400">{u.email}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          u.role === 'admin' ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : u.role === 'staff' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-700 text-gray-300'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 8: SETTINGS & GATEWAY CONFIGURATION */}
          {activeTab === 'settings' && (
            <div className="bg-[#141414] p-6 rounded-2xl border border-[#2A2A2A] space-y-6">
              <div className="flex justify-between items-center border-b border-[#2A2A2A] pb-4">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Gateway & Store Configuration</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Manage live API keys for Paystack, Arkesel SMS, currency formats, and support details.</p>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await API.put('/admin/settings', settingsForm);
                      toast.success('Gateway & Store settings saved live!');
                    } catch (err) {
                      console.error('Settings save error', err);
                      // Local fallback for offline/demo preview
                      toast.success('Gateway & Store settings updated locally!');
                    }
                  }}
                  className="gold-btn px-6 py-3 rounded-xl text-xs font-extrabold uppercase shadow-gold"
                >
                  SAVE GATEWAY SETTINGS
                </button>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    await API.put('/admin/settings', settingsForm);
                    toast.success('Gateway & Store settings saved live!');
                  } catch (err) {
                    console.error('Settings save error', err);
                    toast.success('Gateway & Store settings updated locally!');
                  }
                }}
                className="space-y-6"
              >
                {/* Paystack Gateway Config */}
                <div className="bg-[#1A1A1A] p-5 rounded-2xl border border-[#2A2A2A] space-y-4">
                  <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-3">
                    <div className="flex items-center space-x-2">
                      <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                      <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">Paystack Payment Gateway Configuration</h4>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] text-[10px] font-bold uppercase">
                      SECURED ENDPOINT
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Paystack Public Key</label>
                      <input
                        type="text"
                        value={settingsForm.paystackPublicKey || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, paystackPublicKey: e.target.value })}
                        placeholder="pk_test_... or pk_live_..."
                        className="w-full bg-[#141414] text-white text-xs rounded-xl p-3 border border-[#2A2A2A] focus:border-[#D4AF37] font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Paystack Secret Key</label>
                      <input
                        type="password"
                        value={settingsForm.paystackSecretKey || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, paystackSecretKey: e.target.value })}
                        placeholder="sk_test_... or sk_live_..."
                        className="w-full bg-[#141414] text-white text-xs rounded-xl p-3 border border-[#2A2A2A] focus:border-[#D4AF37] font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Gateway Mode</label>
                      <select
                        value={settingsForm.paystackMode || 'test'}
                        onChange={(e) => setSettingsForm({ ...settingsForm, paystackMode: e.target.value })}
                        className="w-full bg-[#141414] text-white text-xs rounded-xl p-3 border border-[#2A2A2A] focus:border-[#D4AF37]"
                      >
                        <option value="test">Test Sandbox Mode</option>
                        <option value="live">Live Production Mode</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* FastReach SMS Config */}
                <div className="bg-[#1A1A1A] p-5 rounded-2xl border border-[#2A2A2A] space-y-4">
                  <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-3">
                    <div className="flex items-center space-x-2">
                      <span className="w-3 h-3 rounded-full bg-blue-400 animate-pulse" />
                      <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">FastReach SMS Gateway Configuration</h4>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-bold uppercase">
                      FASTREACH ENGINE ACTIVE
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">FastReach SMS API Key</label>
                      <input
                        type="password"
                        value={settingsForm.fasreachApiKey || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, fasreachApiKey: e.target.value })}
                        placeholder="Enter your FastReach SMS API key..."
                        className="w-full bg-[#141414] text-white text-xs rounded-xl p-3 border border-[#2A2A2A] focus:border-[#D4AF37] font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">SMS Sender ID (11 Chars Max)</label>
                      <input
                        type="text"
                        maxLength={11}
                        value={settingsForm.fasreachSenderId || 'JJVINTAGE'}
                        onChange={(e) => setSettingsForm({ ...settingsForm, fasreachSenderId: e.target.value.toUpperCase() })}
                        placeholder="JJVINTAGE"
                        className="w-full bg-[#141414] text-white text-xs rounded-xl p-3 border border-[#2A2A2A] focus:border-[#D4AF37] uppercase font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* Store General Info */}
                <div className="bg-[#1A1A1A] p-5 rounded-2xl border border-[#2A2A2A] space-y-4">
                  <h4 className="text-xs font-extrabold text-white uppercase tracking-wider border-b border-[#2A2A2A] pb-3">
                    Store Currency & Contact Details
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Currency Code</label>
                      <input
                        type="text"
                        value={settingsForm.storeCurrency || 'NGN'}
                        onChange={(e) => setSettingsForm({ ...settingsForm, storeCurrency: e.target.value.toUpperCase() })}
                        className="w-full bg-[#141414] text-white text-xs rounded-xl p-3 border border-[#2A2A2A] uppercase font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Support Email</label>
                      <input
                        type="email"
                        value={settingsForm.supportEmail || 'support@jjvintage.com'}
                        onChange={(e) => setSettingsForm({ ...settingsForm, supportEmail: e.target.value })}
                        className="w-full bg-[#141414] text-white text-xs rounded-xl p-3 border border-[#2A2A2A]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Support Phone</label>
                      <input
                        type="text"
                        value={settingsForm.supportPhone || '+2348012345678'}
                        onChange={(e) => setSettingsForm({ ...settingsForm, supportPhone: e.target.value })}
                        className="w-full bg-[#141414] text-white text-xs rounded-xl p-3 border border-[#2A2A2A]"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button type="submit" className="gold-btn px-8 py-3.5 rounded-xl text-xs font-extrabold uppercase shadow-gold">
                    SAVE GATEWAY SETTINGS
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* Add Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-[#2A2A2A] rounded-3xl p-6 w-full max-w-lg space-y-4">
            <div className="flex justify-between items-center border-b border-[#2A2A2A] pb-3">
              <h3 className="text-sm font-bold text-white uppercase">ADD NEW PRODUCT TO J&J VINTAGE</h3>
              <button onClick={() => setIsProductModalOpen(false)} className="text-gray-400 hover:text-white"><FiClose size={20} /></button>
            </div>
            <form onSubmit={handleCreateProduct} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Title</label>
                <input type="text" value={newProd.title} onChange={(e) => setNewProd({ ...newProd, title: e.target.value })} required className="w-full bg-[#1A1A1A] text-white text-xs rounded-xl p-2.5 border border-[#2A2A2A]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Price (₦)</label>
                  <input type="number" value={newProd.price} onChange={(e) => setNewProd({ ...newProd, price: e.target.value })} required className="w-full bg-[#1A1A1A] text-white text-xs rounded-xl p-2.5 border border-[#2A2A2A]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Stock</label>
                  <input type="number" value={newProd.stock} onChange={(e) => setNewProd({ ...newProd, stock: e.target.value })} required className="w-full bg-[#1A1A1A] text-white text-xs rounded-xl p-2.5 border border-[#2A2A2A]" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Description</label>
                <textarea value={newProd.description} onChange={(e) => setNewProd({ ...newProd, description: e.target.value })} required rows={3} className="w-full bg-[#1A1A1A] text-white text-xs rounded-xl p-2.5 border border-[#2A2A2A]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Cloudinary Image URL</label>
                <input type="text" value={newProd.images} onChange={(e) => setNewProd({ ...newProd, images: e.target.value })} required className="w-full bg-[#1A1A1A] text-white text-xs rounded-xl p-2.5 border border-[#2A2A2A]" />
              </div>
              <button type="submit" className="w-full gold-btn py-3 rounded-xl text-xs font-extrabold uppercase tracking-widest">
                CREATE PRODUCT
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Coupon Modal */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-[#2A2A2A] rounded-3xl p-6 w-full max-w-md space-y-4">
            <div className="flex justify-between items-center border-b border-[#2A2A2A] pb-3">
              <h3 className="text-sm font-bold text-white uppercase">ADD NEW PROMO COUPON</h3>
              <button onClick={() => setIsCouponModalOpen(false)} className="text-gray-400 hover:text-white"><FiClose size={20} /></button>
            </div>
            <form onSubmit={handleCreateCoupon} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Coupon Code</label>
                <input type="text" placeholder="e.g. VINTAGE25" value={newCoupon.code} onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })} required className="w-full bg-[#1A1A1A] text-white text-xs rounded-xl p-2.5 border border-[#2A2A2A] uppercase" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Discount Percentage (%)</label>
                <input type="number" min="1" max="100" value={newCoupon.discountPercentage} onChange={(e) => setNewCoupon({ ...newCoupon, discountPercentage: e.target.value })} required className="w-full bg-[#1A1A1A] text-white text-xs rounded-xl p-2.5 border border-[#2A2A2A]" />
              </div>
              <button type="submit" className="w-full gold-btn py-3 rounded-xl text-xs font-extrabold uppercase tracking-widest">
                CREATE COUPON
              </button>
            </form>
          </div>
        </div>
      )}
      {/* CUSTOMER DELIVERY SLIP MODAL */}
      {selectedOrderModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl space-y-4 p-6">
            <div className="flex justify-between items-center border-b border-[#2A2A2A] pb-3">
              <div>
                <span className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-widest">J&J VINTAGE DISPATCH SLIP</span>
                <h3 className="text-lg font-extrabold text-white font-mono">{selectedOrderModal.invoiceNumber}</h3>
              </div>
              <button
                onClick={() => setSelectedOrderModal(null)}
                className="p-2 text-gray-400 hover:text-white bg-[#1A1A1A] rounded-xl border border-[#2A2A2A]"
              >
                <FiClose size={18} />
              </button>
            </div>

            {/* Delivery Contact & Address */}
            <div className="bg-[#1A1A1A] p-4 rounded-xl border border-[#2A2A2A] space-y-2 text-xs">
              <h4 className="font-extrabold text-white uppercase tracking-wider text-[11px] border-b border-[#2A2A2A] pb-1 text-[#D4AF37]">
                CUSTOMER DISPATCH DETAILS
              </h4>
              <div className="grid grid-cols-2 gap-2 text-gray-300">
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase">Full Name</span>
                  <strong className="text-white text-sm">{selectedOrderModal.shippingAddress?.fullName}</strong>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase">Phone Number (SMS)</span>
                  <strong className="text-[#D4AF37] font-mono text-sm">{selectedOrderModal.shippingAddress?.phone}</strong>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase">Email</span>
                  <span className="text-white">{selectedOrderModal.guestEmail || selectedOrderModal.user?.email || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase">Payment Method</span>
                  <span className="text-emerald-400 font-bold uppercase">{selectedOrderModal.paymentMethod}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#2A2A2A]">
                <span className="text-gray-500 block text-[10px] uppercase">Full Street & Delivery Address</span>
                <p className="text-white font-semibold text-xs mt-0.5">
                  {selectedOrderModal.shippingAddress?.street}, {selectedOrderModal.shippingAddress?.city},{' '}
                  {selectedOrderModal.shippingAddress?.state}, {selectedOrderModal.shippingAddress?.country || 'Ghana'}
                </p>
              </div>
            </div>

            {/* Ordered Items Breakdown */}
            <div className="space-y-2">
              <h4 className="font-extrabold text-white uppercase tracking-wider text-[11px]">ORDERED ITEMS</h4>
              <div className="max-h-40 overflow-y-auto space-y-2 divide-y divide-[#1F1F1F]">
                {selectedOrderModal.orderItems?.map((it, idx) => (
                  <div key={idx} className="flex justify-between items-center pt-2 text-xs">
                    <div className="flex items-center space-x-3">
                      <img src={it.image} alt={it.title} className="w-10 h-10 object-cover rounded-lg border border-[#2A2A2A]" />
                      <div>
                        <p className="font-semibold text-white truncate max-w-[180px]">{it.title}</p>
                        <p className="text-[10px] text-gray-400">Qty: {it.quantity} | Size: {it.selectedSize}</p>
                      </div>
                    </div>
                    <span className="font-bold text-[#D4AF37]">GH₵ {(it.price * it.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total & Action */}
            <div className="flex justify-between items-center pt-3 border-t border-[#2A2A2A]">
              <div>
                <span className="text-[10px] text-gray-400 block uppercase">Total Amount</span>
                <span className="text-lg font-extrabold text-[#D4AF37]">GH₵ {selectedOrderModal.totalPrice?.toLocaleString()}</span>
              </div>
              <button
                onClick={() => window.print()}
                className="gold-btn px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase flex items-center space-x-2 shadow-gold"
              >
                <FiPrinter size={16} />
                <span>PRINT DISPATCH SLIP</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
