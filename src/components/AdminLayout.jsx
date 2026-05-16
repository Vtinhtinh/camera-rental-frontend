import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { to: '/admin', label: 'Tổng quan', icon: '📊' },
    { to: '/admin/products', label: 'Sản phẩm', icon: '📷' },
    { to: '/admin/banners', label: 'Banner', icon: '🎨' },
    { to: '/admin/bookings', label: 'Đơn thuê', icon: '📋' },
    { to: '/admin/users', label: 'Khách hàng', icon: '👥' },
    { to: '/admin/payments', label: 'Thanh toán', icon: '💳' }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <aside className="fixed left-0 top-0 h-full w-64 bg-gray-900 text-white">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-xl">📷</span>
            </div>
            <span className="text-xl font-bold">CameraRent</span>
          </Link>
        </div>

        <nav className="mt-6">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-6 py-3 hover:bg-gray-800 transition ${isActive ? 'bg-gray-800 border-r-4 border-blue-500' : ''}`
              }
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold">{user?.name?.charAt(0)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{user?.name}</p>
              <p className="text-xs text-gray-400">Admin</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full bg-gray-800 hover:bg-gray-700 py-2 rounded-lg flex items-center justify-center gap-2"
          >
            <span>🚪</span>
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      <main className="ml-64 p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
