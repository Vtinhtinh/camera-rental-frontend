import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingApi } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const MyBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const params = {};
        if (statusFilter) params.status = statusFilter;

        const res = await bookingApi.getMyBookings(params);
        setBookings(res.bookings || res.data?.bookings || []);
        setPagination(res.pagination || res.data?.pagination || {});
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [statusFilter]);

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30', label: 'Chờ xác nhận' },
      processing: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30', label: 'Đang xử lý' },
      delivered: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30', label: 'Đã giao' },
      returned: { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/30', label: 'Đã trả' },
      cancelled: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', label: 'Đã hủy' }
    };
    const badge = badges[status] || badges.pending;
    return <span className={`${badge.bg} ${badge.text} ${badge.border} px-3 py-1 rounded-full text-sm font-medium border`}>{badge.label}</span>;
  };

  const getBookingId = (booking) => booking.id || booking._id;

  const handleCancel = async (id) => {
    if (!window.confirm('Bạn có chắc muốn hủy đơn thuê này?')) return;

    try {
      await bookingApi.cancel(id, 'Khách hàng hủy');
      setBookings(bookings.map(b => (b._id === id || b.id === id) ? { ...b, status: 'cancelled' } : b));
    } catch (error) {
      alert('Không thể hủy đơn. Vui lòng thử lại.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-950 border-b border-gray-800">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold text-white mb-3">Đơn thuê của tôi</h1>
          <p className="text-gray-400 text-lg">Xem và quản lý các đơn thuê của bạn</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-700 flex flex-wrap gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="pending">Chờ xác nhận</option>
              <option value="processing">Đang xử lý</option>
              <option value="delivered">Đã giao</option>
              <option value="returned">Đã trả</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>

          {loading ? (
            <div className="p-8">
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-gray-700 h-32 rounded-xl animate-pulse" />
                ))}
              </div>
            </div>
          ) : bookings.length === 0 ? (
            <div className="p-16 text-center">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold text-white mb-2">Chưa có đơn thuê nào</h3>
              <p className="text-gray-400 mb-6">Bắt đầu thuê máy ảnh ngay hôm nay!</p>
              <Link to="/products" className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors inline-block font-medium">
                Xem sản phẩm
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-700">
              {bookings.map((booking) => (
                <div key={getBookingId(booking)} className="p-6 hover:bg-gray-750 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                    <div className="flex items-center gap-4 flex-1">
                      <img
                        src={booking.productId?.mainImage?.startsWith('http') ? booking.productId.mainImage : `${API_BASE}${booking.productId?.mainImage}` || 'https://via.placeholder.com/100'}
                        alt={booking.productId?.name}
                        className="w-24 h-24 object-cover rounded-xl border border-gray-600"
                      />
                      <div className="flex-1">
                        <Link to={`/products/${booking.productId?.id || booking.productId?._id}`} className="font-semibold text-white hover:text-blue-400 transition-colors">
                          {booking.productId?.name || 'Sản phẩm đã xóa'}
                        </Link>
                        <p className="text-sm text-gray-400">{booking.productId?.brand}</p>
                        <p className="text-sm mt-2">
                          <span className="text-gray-400">Mã đơn: </span>
                          <span className="font-medium text-blue-400">{getBookingId(booking)?.slice(-8).toUpperCase()}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 lg:gap-8">
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Ngày nhận</p>
                        <p className="font-medium text-white">{new Date(booking.startDate).toLocaleDateString('vi-VN')}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Ngày trả</p>
                        <p className="font-medium text-white">{new Date(booking.endDate).toLocaleDateString('vi-VN')}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Tổng tiền</p>
                        <p className="font-bold text-blue-400">{booking.totalPrice?.toLocaleString()}đ</p>
                      </div>
                      <div>{getStatusBadge(booking.status)}</div>
                      <div className="flex gap-2">
                        {/* Nút thanh toán cho đơn pending */}
                        {booking.status === 'pending' && (
                          <Link
                            to={`/payment?bookingId=${getBookingId(booking)}&amount=${booking.totalPrice}&description=Thanh+toan+don+thue`}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                          >
                            Thanh toán
                          </Link>
                        )}
                        {booking.status === 'pending' && (
                          <button
                            onClick={() => handleCancel(getBookingId(booking))}
                            className="px-4 py-2 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
                          >
                            Hủy
                          </button>
                        )}
                        <Link
                          to={`/products/${booking.productId?.id || booking.productId?._id}`}
                          className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          Chi tiết
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyBookings;
