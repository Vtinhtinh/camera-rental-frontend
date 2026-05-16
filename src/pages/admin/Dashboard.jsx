import { useState, useEffect } from 'react';
import { adminProductApi } from '../../api/endpoints';
import { adminBookingApi } from '../../api/endpoints';
import { userApi } from '../../api/endpoints';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    products: { total: 0, available: 0, outOfStock: 0 },
    bookings: { total: 0, pending: 0, todayRevenue: 0 },
    users: { total: 0, newThisMonth: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [productStats, bookingStats, userStats] = await Promise.all([
          adminProductApi.getStats(),
          adminBookingApi.getStats(),
          userApi.getStats()
        ]);

        setStats({
          products: productStats.data,
          bookings: bookingStats.data,
          users: userStats.data
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-300 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-300 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    { title: 'Tổng sản phẩm', value: stats.products.total, icon: '📷', color: 'bg-blue-500' },
    { title: 'Đơn chờ xử lý', value: stats.bookings.pending, icon: '⏳', color: 'bg-yellow-500' },
    { title: 'Khách hàng', value: stats.users.total, icon: '👥', color: 'bg-green-500' },
    { title: 'Doanh thu hôm nay', value: `${stats.bookings.todayRevenue.toLocaleString()}đ`, icon: '💰', color: 'bg-purple-500' }
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Tổng quan</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{stat.title}</p>
                <p className="text-3xl font-bold mt-2">{stat.value}</p>
              </div>
              <div className={`${stat.color} w-14 h-14 rounded-xl flex items-center justify-center text-2xl`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h2 className="text-lg font-semibold mb-4">Thống kê sản phẩm</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Tổng sản phẩm</span>
              <span className="font-semibold">{stats.products.total}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Còn hàng</span>
              <span className="font-semibold text-green-600">{stats.products.available}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Hết hàng</span>
              <span className="font-semibold text-red-600">{stats.products.outOfStock}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md">
          <h2 className="text-lg font-semibold mb-4">Thống kê đơn hàng</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Tổng đơn</span>
              <span className="font-semibold">{stats.bookings.total}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Chờ xử lý</span>
              <span className="font-semibold text-yellow-600">{stats.bookings.pending}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Đang giao</span>
              <span className="font-semibold text-blue-600">{stats.bookings.processing}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Đã hoàn thành</span>
              <span className="font-semibold text-green-600">{stats.bookings.returned}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md">
          <h2 className="text-lg font-semibold mb-4">Thống kê khách hàng</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Tổng khách hàng</span>
              <span className="font-semibold">{stats.users.total}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Khách mới (tháng này)</span>
              <span className="font-semibold text-blue-600">{stats.users.newThisMonth}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Quản trị viên</span>
              <span className="font-semibold">{stats.users.admins}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md">
          <h2 className="text-lg font-semibold mb-4">Liên kết nhanh</h2>
          <div className="grid grid-cols-2 gap-4">
            <a href="/admin/products" className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition">
              <span className="text-2xl">📷</span>
              <p className="font-medium mt-2">Quản lý sản phẩm</p>
            </a>
            <a href="/admin/bookings" className="p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition">
              <span className="text-2xl">📋</span>
              <p className="font-medium mt-2">Quản lý đơn thuê</p>
            </a>
            <a href="/admin/banners" className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition">
              <span className="text-2xl">🎨</span>
              <p className="font-medium mt-2">Quản lý banner</p>
            </a>
            <a href="/admin/users" className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition">
              <span className="text-2xl">👥</span>
              <p className="font-medium mt-2">Quản lý khách hàng</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
