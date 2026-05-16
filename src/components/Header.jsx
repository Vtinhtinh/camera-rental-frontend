import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsUserMenuOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-soft sticky top-0 z-50">
      <nav className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-xl flex items-center justify-center shadow-btn group-hover:shadow-glow transition-all duration-300">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="text-2xl font-extrabold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent tracking-tight">
              CameraRent
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-10">
            <Link to="/" className="nav-link">Trang chủ</Link>
            <Link to="/products" className="nav-link">Sản phẩm</Link>
            <Link to="/pricing" className="nav-link">Bảng giá</Link>
            <Link to="/feedback" className="nav-link">Đánh giá</Link>
            <Link to="/contact" className="nav-link">Liên hệ</Link>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Search Button */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-3 rounded-xl hover:bg-slate-100 transition-colors duration-200 group"
            >
              <svg className="w-6 h-6 text-slate-600 group-hover:text-primary-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Cart */}
            <Link
              to="/my-bookings"
              className="p-3 rounded-xl hover:bg-slate-100 transition-colors duration-200 relative group"
            >
              <svg className="w-6 h-6 text-slate-600 group-hover:text-primary-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </Link>

            {/* User */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100 transition-colors duration-200"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-full flex items-center justify-center shadow-btn">
                    <span className="text-white font-semibold">{user?.name?.charAt(0).toUpperCase()}</span>
                  </div>
                  <span className="hidden md:block text-slate-700 font-medium max-w-24 truncate">{user?.name}</span>
                  <svg className="w-4 h-4 text-slate-400 hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-hover border border-slate-100 py-2 z-50 animate-fadeIn">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="font-semibold text-slate-900">{user?.name}</p>
                      <p className="text-sm text-slate-500">{user?.email}</p>
                    </div>
                    <Link to="/my-bookings" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-primary-600 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      Đơn thuê của tôi
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-primary-600 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Quản trị hệ thống
                      </Link>
                    )}
                    <div className="border-t border-slate-100 mt-2 pt-2">
                      <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 text-red-500 hover:bg-red-50 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <Link to="/login" className="px-5 py-2.5 text-slate-600 hover:text-primary-600 font-medium transition-colors">
                  Đăng nhập
                </Link>
                <Link to="/register" className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold rounded-full hover:shadow-btn transition-all duration-300 hover:-translate-y-0.5">
                  Đăng ký
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <svg className={`w-6 h-6 text-slate-600 transition-transform duration-300 ${isMenuOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {isSearchOpen && (
          <div className="absolute left-0 right-0 top-full bg-white border-b border-slate-200 shadow-hover animate-slideDown">
            <div className="container mx-auto px-4 py-4">
              <form onSubmit={handleSearch} className="flex gap-3">
                <div className="flex-1 relative">
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm máy ảnh..."
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:bg-white outline-none transition-all"
                    autoFocus
                  />
                </div>
                <button type="submit" className="px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-medium rounded-xl hover:shadow-btn transition-all duration-300 hover:-translate-y-0.5">
                  Tìm kiếm
                </button>
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="px-4 py-3 text-slate-500 hover:text-slate-700"
                >
                  Hủy
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-200 animate-slideDown">
            <div className="flex flex-col gap-1">
              <Link to="/" onClick={() => setIsMenuOpen(false)} className="mobile-nav-link">
                Trang chủ
              </Link>
              <Link to="/products" onClick={() => setIsMenuOpen(false)} className="mobile-nav-link">
                Sản phẩm
              </Link>
              <Link to="/pricing" onClick={() => setIsMenuOpen(false)} className="mobile-nav-link">
                Bảng giá
              </Link>
              <Link to="/feedback" onClick={() => setIsMenuOpen(false)} className="mobile-nav-link">
                Đánh giá
              </Link>
              <Link to="/contact" onClick={() => setIsMenuOpen(false)} className="mobile-nav-link">
                Liên hệ
              </Link>
              {!isAuthenticated && (
                <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-200">
                  <Link to="/login" onClick={() => setIsMenuOpen(false)} className="px-4 py-3 text-center text-slate-600 hover:text-primary-600 font-medium rounded-xl border border-slate-200 hover:border-primary-300 hover:bg-slate-50 transition-colors">
                    Đăng nhập
                  </Link>
                  <Link to="/register" onClick={() => setIsMenuOpen(false)} className="px-4 py-3 text-center bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold rounded-full hover:shadow-btn transition-all duration-300">
                    Đăng ký
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Click outside to close user menu */}
      {isUserMenuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />
      )}

      <style>{`
        .nav-link {
          position: relative;
          padding: 0.5rem 0;
          font-medium;
          color: #64748b;
          transition: color 0.2s;
        }
        .nav-link:hover {
          color: #4f46e5;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 2px;
          background: linear-gradient(to right, #4f46e5, #7c3aed);
          transition: width 0.3s ease;
        }
        .nav-link:hover::after {
          width: 100%;
        }
        .mobile-nav-link {
          padding: 0.875rem 1rem;
          font-medium;
          color: #64748b;
          border-radius: 0.75rem;
          transition: all 0.2s;
        }
        .mobile-nav-link:hover {
          background: #f1f5f9;
          color: #4f46e5;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </header>
  );
};

export default Header;
