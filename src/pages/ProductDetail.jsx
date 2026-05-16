import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productApi, feedbackApi } from '../api/endpoints';
import StarRating from '../components/StarRating';
import ProductCard from '../components/ProductCard';
import BookingModal from '../components/BookingModal';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({ rating: 5, content: '', title: '' });
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await productApi.getById(id);
        setProduct(res.data.product);
        setRelatedProducts(res.data.relatedProducts || []);

        const feedbackRes = await feedbackApi.getByProduct(id, { limit: 5 });
        setFeedbacks(feedbackRes.data.feedbacks || []);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    setSubmittingFeedback(true);
    try {
      await feedbackApi.create({ ...feedbackForm, productId: id });
      const feedbackRes = await feedbackApi.getByProduct(id, { limit: 5 });
      setFeedbacks(feedbackRes.data.feedbacks || []);
      setFeedbackForm({ rating: 5, content: '', title: '' });
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="bg-gray-800 h-[500px] rounded-2xl animate-pulse border border-gray-700" />
            <div className="space-y-4">
              <div className="bg-gray-800 h-10 rounded-xl w-3/4 animate-pulse border border-gray-700" />
              <div className="bg-gray-800 h-6 rounded-xl w-1/2 animate-pulse border border-gray-700" />
              <div className="bg-gray-800 h-48 rounded-xl animate-pulse border border-gray-700" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-800 rounded-full flex items-center justify-center border border-gray-700">
            <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">Không tìm thấy sản phẩm</h1>
          <Link to="/products" className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors">
            Quay lại trang sản phẩm
          </Link>
        </div>
      </div>
    );
  }

  const images = product.images?.length > 0 ? product.images : [product.mainImage || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800'];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Breadcrumb */}
      <div className="bg-gray-950 border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-gray-400 hover:text-blue-400 transition-colors">Trang chủ</Link>
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <Link to="/products" className="text-gray-400 hover:text-blue-400 transition-colors">Sản phẩm</Link>
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-300 font-medium truncate">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-700">
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-[400px] lg:h-[500px] object-contain p-4"
              />
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.isHot && (
                  <span className="px-3 py-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full shadow-lg animate-pulse">
                    🔥 HOT
                  </span>
                )}
                {product.isNew && (
                  <span className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold rounded-full shadow-lg">
                    ✨ MỚI
                  </span>
                )}
                {product.isFeatured && (
                  <span className="px-3 py-1.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg">
                    ⭐ NỔI BẬT
                  </span>
                )}
              </div>
            </div>
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 hover:scale-105 ${
                      selectedImage === i ? 'border-blue-500 shadow-lg' : 'border-gray-700'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1.5 bg-blue-500/20 text-blue-400 text-sm font-medium rounded-lg border border-blue-500/30">
                  {product.brand}
                </span>
                <span className="px-3 py-1.5 bg-gray-700/50 text-gray-300 text-sm font-medium rounded-lg border border-gray-600">
                  {product.category}
                </span>
                <span className={`px-3 py-1.5 text-sm font-medium rounded-lg ${
                  product.stock > 0 ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                  {product.stock > 0 ? '✓ Còn hàng' : 'Hết hàng'}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4">{product.name}</h1>
              <div className="flex items-center gap-4">
                <StarRating rating={product.averageRating || 0} />
                <span className="text-lg font-semibold text-white">
                  {product.averageRating?.toFixed(1) || '0'}
                </span>
                <span className="text-gray-400">({product.reviewCount || 0} đánh giá)</span>
              </div>
            </div>

            {/* Pricing Card */}
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-2xl p-6 border border-blue-500/20">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Bảng giá thuê
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-800/50 rounded-xl p-4 text-center border border-gray-700">
                  <p className="text-sm text-gray-400 mb-1">3 tiếng</p>
                  <p className="text-lg font-bold text-blue-400">{product.pricing?.price3h?.toLocaleString()}đ</p>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4 text-center border border-gray-700">
                  <p className="text-sm text-gray-400 mb-1">6 tiếng</p>
                  <p className="text-lg font-bold text-blue-400">{product.pricing?.price6h?.toLocaleString()}đ</p>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4 text-center border border-gray-700">
                  <p className="text-sm text-gray-400 mb-1">12 tiếng</p>
                  <p className="text-lg font-bold text-blue-400">{product.pricing?.price12h?.toLocaleString()}đ</p>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4 text-center border border-gray-700">
                  <p className="text-sm text-gray-400 mb-1">1 ngày</p>
                  <p className="text-lg font-bold text-blue-400">{product.pricing?.price1d?.toLocaleString()}đ</p>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4 text-center border border-gray-700">
                  <p className="text-sm text-gray-400 mb-1">2 ngày</p>
                  <p className="text-lg font-bold text-blue-400">{product.pricing?.price2d?.toLocaleString()}đ</p>
                </div>
                <div className="col-span-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4 text-center shadow-lg">
                  <p className="text-sm text-blue-200 mb-1">3 ngày trở lên (mỗi ngày)</p>
                  <p className="text-2xl font-bold text-white">{product.pricing?.price3dPlus?.toLocaleString()}đ</p>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => setShowBookingModal(true)}
                disabled={product.stock < 1}
                className={`w-full py-4 rounded-2xl text-lg font-bold transition-all duration-300 ${
                  product.stock > 0
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.02] active:scale-[0.98]'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                {product.stock > 0 ? '📅 Đặt thuê ngay' : 'Hiện không có sẵn'}
              </button>
              <div className="grid grid-cols-2 gap-3">
                <button className="py-3.5 rounded-xl font-semibold border-2 border-gray-600 hover:border-red-500/50 hover:bg-red-500/10 transition-all duration-200 flex items-center justify-center gap-2 text-gray-300 hover:text-red-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Yêu thích
                </button>
                <button className="py-3.5 rounded-xl font-semibold border-2 border-gray-600 hover:border-gray-500 hover:bg-gray-700/50 transition-all duration-200 flex items-center justify-center gap-2 text-gray-300 hover:text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Chia sẻ
                </button>
              </div>
            </div>

            {/* Quick Info */}
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 space-y-4">
              <h3 className="font-bold text-white">Phụ kiện đi kèm</h3>
              {product.accessories?.length > 0 ? (
                <ul className="space-y-2">
                  {product.accessories.map((acc, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-300">
                      <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>{acc.name} {acc.quantity > 1 ? `x${acc.quantity}` : ''}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400">Không có phụ kiện</p>
              )}
            </div>

            {/* Policies */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700">
              <h3 className="font-bold text-white mb-4">Cam kết của chúng tôi</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <span className="text-gray-300">Đặt cọc CMND/CCCD khi thuê</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <span className="text-gray-300">Giao hàng miễn phí nội thành TP.HCM</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <span className="text-gray-300">Hỗ trợ kỹ thuật 24/7</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <span className="text-gray-300">Bảo hiểm thiết bị trong quá trình thuê</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Description & Specs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-4">Mô tả sản phẩm</h2>
              <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                {product.description || 'Không có mô tả'}
              </p>
            </div>

            {/* Specifications */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                <h2 className="text-xl font-bold text-white mb-4">Thông số kỹ thuật</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between py-3 border-b border-gray-700 last:border-0">
                      <span className="text-gray-400">{key}</span>
                      <span className="font-medium text-white">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Reviews Sidebar */}
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-4">Đánh giá</h2>
              
              {/* Rating Summary */}
              <div className="flex items-center gap-4 mb-6 p-4 bg-gray-700/50 rounded-xl border border-gray-600">
                <div className="text-center">
                  <div className="text-4xl font-bold text-white">{product.averageRating?.toFixed(1) || '0'}</div>
                  <StarRating rating={product.averageRating || 0} />
                  <div className="text-sm text-gray-400 mt-1">{product.reviewCount || 0} đánh giá</div>
                </div>
              </div>

              {/* Reviews List */}
              {feedbacks.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">Chưa có đánh giá nào</p>
                </div>
              ) : (
                <div className="space-y-4 mb-6">
                  {feedbacks.map((feedback) => (
                    <div key={feedback.id} className="pb-4 border-b border-gray-700 last:border-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {feedback.customerName?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-white">{feedback.customerName}</p>
                          <StarRating rating={feedback.rating} size="sm" />
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(feedback.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      {feedback.title && <h4 className="font-semibold text-white mb-1">{feedback.title}</h4>}
                      <p className="text-gray-400 text-sm">{feedback.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Feedback Form */}
              <form onSubmit={handleSubmitFeedback} className="pt-4 border-t border-gray-700">
                <h3 className="font-semibold text-white mb-4">Viết đánh giá của bạn</h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Đánh giá</label>
                  <StarRating rating={feedbackForm.rating} interactive onChange={(r) => setFeedbackForm({ ...feedbackForm, rating: r })} />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Tiêu đề</label>
                  <input
                    type="text"
                    value={feedbackForm.title}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, title: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-white placeholder-gray-500"
                    placeholder="Nhận xét ngắn gọn"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Nội dung</label>
                  <textarea
                    value={feedbackForm.content}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, content: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none text-white placeholder-gray-500"
                    placeholder="Chia sẻ trải nghiệm của bạn..."
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={submittingFeedback}
                  className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {submittingFeedback ? 'Đang gửi...' : 'Gửi đánh giá'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Sản phẩm tương tự</h2>
              <Link to="/products" className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-2">
                Xem tất cả
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <BookingModal product={product} onClose={() => setShowBookingModal(false)} />
      )}
    </div>
  );
};

export default ProductDetail;
