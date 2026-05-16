import { Link } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const ProductCard = ({ product, className = '' }) => {
  return (
    <div className={`group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-soft hover:shadow-hover transition-all duration-500 hover:-translate-y-1 ${className}`}>
      {/* Image Container */}
      <div className="relative overflow-hidden aspect-[4/3]">
        <img
          src={product.mainImage?.startsWith('http') ? product.mainImage : `${API_BASE}${product.mainImage}` || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=300&fit=crop'}
          alt={product.name}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
        />
        
        {/* Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-4 left-4 right-4 flex gap-2">
            <Link
              to={`/products/${product.id}`}
              className="flex-1 bg-white text-slate-900 py-2.5 rounded-xl text-center font-semibold text-sm hover:bg-slate-100 transition-colors"
            >
              Xem chi tiết
            </Link>
            <button className="w-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {product.isHot && (
            <span className="px-3 py-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full shadow-lg">
              🔥 HOT
            </span>
          )}
          {product.isNew && (
            <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold rounded-full shadow-lg">
              ✨ MỚI
            </span>
          )}
          {product.isFeatured && (
            <span className="px-3 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg">
              ⭐ NỔI BẬT
            </span>
          )}
        </div>

        {/* Stock Status */}
        <div className="absolute top-4 right-4">
          {product.stock > 0 ? (
            <span className="px-3 py-1 bg-emerald-500/90 backdrop-blur-sm text-white text-xs font-medium rounded-full">
              ✓ Còn hàng
            </span>
          ) : (
            <span className="px-3 py-1 bg-red-500/90 backdrop-blur-sm text-white text-xs font-medium rounded-full">
              Hết hàng
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Brand & Category */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-1 rounded-lg border border-primary-100">
            {product.brand}
          </span>
          <span className="text-slate-400">•</span>
          <span className="text-xs text-slate-400">{product.category}</span>
        </div>

        {/* Product Name */}
        <Link to={`/products/${product.id}`}>
          <h3 className="font-bold text-slate-900 mb-3 line-clamp-2 group-hover:text-primary-600 transition-colors duration-200 min-h-[3rem]">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-4 h-4 ${i < Math.round(product.averageRating || 0) ? 'text-amber-400' : 'text-slate-200'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-sm text-slate-600">
            {product.averageRating?.toFixed(1) || '0'}
          </span>
          <span className="text-xs text-slate-400">({product.reviewCount || 0} đánh giá)</span>
        </div>

        {/* Pricing */}
        <div className="flex items-end justify-between pt-4 border-t border-slate-100">
          <div>
            <p className="text-xs text-slate-500 mb-1">Giá thuê</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                {product.pricing?.price1d?.toLocaleString() || '0'}
              </span>
              <span className="text-sm font-medium text-slate-500">đ</span>
            </div>
            <p className="text-xs text-slate-400">/ngày</p>
          </div>
          <Link
            to={`/products/${product.id}`}
            className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold rounded-full hover:shadow-btn transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
          >
            Thuê ngay
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
