import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { productApi } from '../api/endpoints';
import ProductCard from '../components/ProductCard';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [showFilter, setShowFilter] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [filters, setFilters] = useState({
    brand: searchParams.get('brand') || '',
    category: searchParams.get('category') || '',
    search: searchParams.get('search') || '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1
  });

  const categories = [
    { value: '', label: 'Tất cả' },
    { value: 'Du lịch', label: '📸 Du lịch' },
    { value: 'Vlog', label: '🎬 Vlog' },
    { value: 'Chuyên nghiệp', label: '🏆 Chuyên nghiệp' },
  ];

  const sortOptions = [
    { value: 'createdAt-desc', label: 'Mới nhất' },
    { value: 'price-asc', label: 'Giá thấp → cao' },
    { value: 'price-desc', label: 'Giá cao → thấp' },
    { value: 'rentalCount-desc', label: 'Phổ biến nhất' },
  ];

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await productApi.getBrands();
        setBrands(res.data.brands || []);
      } catch (error) {
        console.error('Error fetching brands:', error);
      }
    };
    fetchBrands();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {};
        if (filters.brand) params.brand = filters.brand;
        if (filters.category) params.category = filters.category;
        if (filters.search) params.search = filters.search;
        if (filters.minPrice) params.minPrice = filters.minPrice;
        if (filters.maxPrice) params.maxPrice = filters.maxPrice;
        params.sortBy = filters.sortBy;
        params.sortOrder = filters.sortOrder;
        params.page = filters.page;
        params.limit = 12;

        const res = await productApi.getAll(params);
        setProducts(res.data.products || []);
        setPagination(res.data.pagination || {});
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value, page: 1 });
  };

  const handlePageChange = (page) => {
    setFilters({ ...filters, page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setFilters({
      brand: '',
      category: '',
      search: '',
      minPrice: '',
      maxPrice: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      page: 1
    });
    setSearchParams({});
  };

  const hasActiveFilters = filters.brand || filters.category || filters.search || filters.minPrice || filters.maxPrice;

  const FilterSidebar = () => (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-3">Tìm kiếm</label>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Tên máy ảnh..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-slate-900 placeholder-slate-400"
          />
        </div>
      </div>

      {/* Brand */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-3">Hãng</label>
        <div className="space-y-2">
          <button
            onClick={() => handleFilterChange('brand', '')}
            className={`w-full text-left px-4 py-2.5 rounded-xl transition-all ${
              !filters.brand ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-btn' : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            Tất cả hãng
          </button>
          {brands.map((brand) => (
            <button
              key={brand}
              onClick={() => handleFilterChange('brand', brand)}
              className={`w-full text-left px-4 py-2.5 rounded-xl transition-all ${
                filters.brand === brand ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-btn' : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              {brand}
            </button>
          ))}
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-3">Mục đích</label>
        <div className="space-y-2">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => handleFilterChange('category', cat.value)}
              className={`w-full text-left px-4 py-2.5 rounded-xl transition-all ${
                filters.category === cat.value ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-btn' : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-3">Khoảng giá (VNĐ/ngày)</label>
        <div className="flex gap-3">
          <input
            type="number"
            placeholder="Từ"
            value={filters.minPrice}
            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
            className="w-1/2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-slate-900 placeholder-slate-400"
          />
          <input
            type="number"
            placeholder="Đến"
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            className="w-1/2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-slate-900 placeholder-slate-400"
          />
        </div>
      </div>

      {/* Sort */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-3">Sắp xếp</label>
        <select
          value={`${filters.sortBy}-${filters.sortOrder}`}
          onChange={(e) => {
            const [sortBy, sortOrder] = e.target.value.split('-');
            handleFilterChange('sortBy', sortBy);
            handleFilterChange('sortOrder', sortOrder);
          }}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-slate-900"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="w-full py-3 bg-red-50 text-red-600 font-medium rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2 border border-red-100"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Xóa tất cả bộ lọc
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-soft">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-3">
            <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">Sản Phẩm</span>
          </h1>
          <p className="text-slate-500 text-lg">Khám phá bộ sưu tập máy ảnh cho thuê</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-soft sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg text-slate-900">Bộ lọc</h3>
                {hasActiveFilters && (
                  <span className="px-2 py-1 bg-primary-100 text-primary-600 text-xs font-medium rounded-full border border-primary-200">
                    Đang lọc
                  </span>
                )}
              </div>
              <FilterSidebar />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Top Bar */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-soft mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Mobile Filter Toggle */}
                  <button
                    onClick={() => setIsFilterOpen(true)}
                    className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors text-slate-700"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    <span className="font-medium">Bộ lọc</span>
                  </button>
                  <p className="text-slate-500">
                    <span className="font-semibold text-slate-900">{pagination.totalProducts || 0}</span> sản phẩm
                  </p>
                </div>
                
                {/* Active Filters Pills */}
                <div className="hidden md:flex items-center gap-2 flex-wrap">
                  {filters.brand && (
                    <span className="px-3 py-1.5 bg-primary-100 text-primary-600 text-sm rounded-full flex items-center gap-2 border border-primary-200">
                      {filters.brand}
                      <button onClick={() => handleFilterChange('brand', '')} className="hover:text-primary-800">×</button>
                    </span>
                  )}
                  {filters.category && (
                    <span className="px-3 py-1.5 bg-emerald-100 text-emerald-600 text-sm rounded-full flex items-center gap-2 border border-emerald-200">
                      {filters.category}
                      <button onClick={() => handleFilterChange('category', '')} className="hover:text-emerald-800">×</button>
                    </span>
                  )}
                  {filters.search && (
                    <span className="px-3 py-1.5 bg-violet-100 text-secondary-600 text-sm rounded-full flex items-center gap-2 border border-violet-200">
                      "{filters.search}"
                      <button onClick={() => handleFilterChange('search', '')} className="hover:text-secondary-800">×</button>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-slate-100 h-[450px] rounded-2xl animate-pulse border border-slate-200" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-2xl p-16 text-center border border-slate-100 shadow-soft">
                <div className="w-24 h-24 mx-auto mb-6 bg-slate-100 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Không tìm thấy sản phẩm</h3>
                <p className="text-slate-500 mb-6">Hãy thử điều chỉnh bộ lọc hoặc tìm kiếm với từ khóa khác</p>
                <button onClick={clearFilters} className="px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-medium rounded-full hover:shadow-btn transition-all">
                  Xóa bộ lọc
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product, index) => (
                    <div
                      key={product.id}
                      className="animate-fade-in-up"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center mt-12">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                        disabled={pagination.currentPage === 1}
                        className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-slate-600"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      
                      {[...Array(pagination.totalPages)].map((_, i) => {
                        const page = i + 1;
                        if (
                          page === 1 || 
                          page === pagination.totalPages || 
                          (page >= pagination.currentPage - 1 && page <= pagination.currentPage + 1)
                        ) {
                          return (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`w-10 h-10 flex items-center justify-center rounded-xl font-medium transition-colors ${
                                pagination.currentPage === page
                                  ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-btn'
                                  : 'border border-slate-200 hover:bg-slate-100 text-slate-600'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        } else if (page === pagination.currentPage - 2 || page === pagination.currentPage + 2) {
                          return <span key={page} className="px-2 text-slate-400">...</span>;
                        }
                        return null;
                      })}
                      
                      <button
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                        disabled={pagination.currentPage === pagination.totalPages}
                        className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-slate-600"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsFilterOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-2xl animate-slideIn border-l border-slate-100">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-900">Bộ lọc</h3>
              <button onClick={() => setIsFilterOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto h-[calc(100%-73px)]">
              <FilterSidebar />
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
        }
        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Products;
