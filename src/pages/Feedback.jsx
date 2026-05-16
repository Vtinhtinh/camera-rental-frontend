import { useState, useEffect } from 'react';
import { feedbackApi, productApi } from '../api/endpoints';
import StarRating from '../components/StarRating';

const Feedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ productId: '', brand: '', sortBy: 'createdAt' });
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await productApi.getAll({ limit: 100 });
        setProducts(res.data.products || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      setLoading(true);
      try {
        const params = {};
        if (filters.productId) params.productId = filters.productId;
        if (filters.sortBy) params.sortBy = filters.sortBy;
        params.limit = 12;

        const res = await feedbackApi.getAll(params);
        setFeedbacks(res.data.feedbacks || []);
        setPagination(res.data.pagination || {});
      } catch (error) {
        console.error('Error fetching feedbacks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, [filters]);

  const brands = [...new Set(products.map(p => p.brand))];

  const getProductName = (productId) => {
    const product = products.find(p => p.id === productId);
    return product?.name || 'Sản phẩm đã xóa';
  };

  const getProductBrand = (productId) => {
    const product = products.find(p => p.id === productId);
    return product?.brand || '';
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-950 border-b border-gray-800">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold text-white mb-3">Đánh giá của khách hàng</h1>
          <p className="text-gray-400 text-lg">Những trải nghiệm thực tế từ khách hàng</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Section */}
        <section className="mb-8">
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl p-8 border border-blue-500/20">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <div className="text-5xl font-bold text-white mb-2">
                  {feedbacks.length > 0 ? (feedbacks.reduce((acc, f) => acc + f.rating, 0) / feedbacks.length).toFixed(1) : '0'}
                </div>
                <div className="flex justify-center md:justify-start gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className={`w-6 h-6 ${star <= 4 ? 'text-yellow-400' : 'text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-400">trên 5 sao</p>
              </div>
              <div className="flex gap-2 flex-wrap justify-center">
                <button
                  onClick={() => setFilters({ ...filters, sortBy: 'createdAt' })}
                  className={`px-4 py-2 rounded-lg transition-colors ${filters.sortBy === 'createdAt' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'}`}
                >
                  Mới nhất
                </button>
                <button
                  onClick={() => setFilters({ ...filters, sortBy: 'rating' })}
                  className={`px-4 py-2 rounded-lg transition-colors ${filters.sortBy === 'rating' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'}`}
                >
                  Đánh giá cao
                </button>
                <button
                  onClick={() => setFilters({ ...filters, sortBy: 'helpful' })}
                  className={`px-4 py-2 rounded-lg transition-colors ${filters.sortBy === 'helpful' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'}`}
                >
                  Hữu ích nhất
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <select
              value={filters.brand}
              onChange={(e) => setFilters({ ...filters, brand: e.target.value, productId: '' })}
              className="bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 flex-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="">Tất cả hãng</option>
              {brands.map((brand) => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
            <select
              value={filters.productId}
              onChange={(e) => setFilters({ ...filters, productId: e.target.value })}
              className="bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 flex-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="">Tất cả sản phẩm</option>
              {products
                .filter(p => !filters.brand || p.brand === filters.brand)
                .map((product) => (
                  <option key={product.id} value={product.id}>{product.name}</option>
                ))
              }
            </select>
          </div>
        </section>

        {/* Feedbacks Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-800 h-48 rounded-2xl animate-pulse border border-gray-700" />
            ))}
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="text-center py-16 bg-gray-800 rounded-2xl border border-gray-700">
            <p className="text-gray-400 mb-4">Chưa có đánh giá nào</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {feedbacks.map((feedback) => (
                <div key={feedback.id} className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-gray-600 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-lg">
                        {feedback.customerName?.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-white">{feedback.customerName}</h3>
                          {feedback.isVerified && (
                            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded border border-green-500/30">
                              Đã mua
                            </span>
                          )}
                        </div>
                        <StarRating rating={feedback.rating} size="sm" />
                      </div>
                      <p className="text-sm text-gray-400 mb-2">
                        {feedback.productId?.name || getProductName(feedback.productId)}
                        {' • '}
                        {feedback.productId?.brand || getProductBrand(feedback.productId)}
                      </p>
                      {feedback.title && (
                        <h4 className="font-semibold text-white mb-1">{feedback.title}</h4>
                      )}
                      <p className="text-gray-300 mb-3">{feedback.content}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>
                          {new Date(feedback.createdAt).toLocaleDateString('vi-VN', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </span>
                        {feedback.deviceUsed && (
                          <span className="text-gray-400">📱 {feedback.deviceUsed}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <div className="flex justify-center mt-8 gap-2">
                <button
                  onClick={() => setFilters({ ...filters, page: pagination.currentPage - 1 })}
                  disabled={pagination.currentPage === 1}
                  className="px-4 py-2 border border-gray-700 rounded-lg disabled:opacity-50 text-gray-300 hover:bg-gray-800 transition-colors"
                >
                  ←
                </button>
                {[...Array(pagination.totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setFilters({ ...filters, page: i + 1 })}
                    className={`px-4 py-2 border rounded-lg transition-colors ${pagination.currentPage === i + 1 ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-700 text-gray-300 hover:bg-gray-800'}`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setFilters({ ...filters, page: pagination.currentPage + 1 })}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="px-4 py-2 border border-gray-700 rounded-lg disabled:opacity-50 text-gray-300 hover:bg-gray-800 transition-colors"
                >
                  →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Feedback;
