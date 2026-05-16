import { useState, useEffect, useCallback } from 'react';
import { adminBookingApi } from '../../api/endpoints';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', paymentStatus: '', startDate: '', endDate: '' });
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Auto-refresh bookings every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchBookings(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, filters]);

  const fetchBookings = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);

      const res = await adminBookingApi.getAll(filters);
      setBookings(res.data.bookings || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const updateStatus = async (id, status) => {
    try {
      await adminBookingApi.updateStatus(id, { status });
      fetchBookings();
      // Update selected booking if modal is open
      if (selectedBooking?.id === id) {
        setSelectedBooking({ ...selectedBooking, status });
      }
    } catch (error) {
      alert('Có lỗi xảy ra khi cập nhật trạng thái!');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Chờ xác nhận', icon: '⏳' },
      confirmed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Đã xác nhận', icon: '✅' },
      processing: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Đang xử lý', icon: '🔄' },
      delivered: { bg: 'bg-green-100', text: 'text-green-800', label: 'Đã giao', icon: '📦' },
      returned: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Đã trả', icon: '✅' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Đã hủy', icon: '❌' }
    };
    const badge = badges[status] || badges.pending;
    return (
      <span className={`${badge.bg} ${badge.text} px-3 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1`}>
        <span>{badge.icon}</span>
        {badge.label}
      </span>
    );
  };

  const getPaymentBadge = (paymentStatus) => {
    const badges = {
      unpaid: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Chưa thanh toán', icon: '⏳' },
      paid: { bg: 'bg-green-100', text: 'text-green-800', label: 'Đã thanh toán', icon: '✅' },
      partial: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Thanh toán một phần', icon: '💳' }
    };
    const badge = badges[paymentStatus] || badges.unpaid;
    return (
      <span className={`${badge.bg} ${badge.text} px-2 py-0.5 rounded text-xs font-medium inline-flex items-center gap-1`}>
        <span>{badge.icon}</span>
        {badge.label}
      </span>
    );
  };

  const openDetailModal = (booking) => {
    setSelectedBooking(booking);
    setShowDetailModal(true);
  };

  const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

  const getImageUrl = (url) => {
    if (!url) return '';
    return url.startsWith('http') ? url : `${API_BASE}${url}`;
  };

  // Booking Detail Modal
  const renderDetailModal = () => {
    if (!selectedBooking) return null;

    const docs = selectedBooking.identityDocuments || {};

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">Chi tiết đơn thuê</h3>
            <button
              onClick={() => setShowDetailModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Status & Actions */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {getStatusBadge(selectedBooking.status)}
                {getPaymentBadge(selectedBooking.paymentStatus)}
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={selectedBooking.status}
                  onChange={(e) => updateStatus(selectedBooking.id, e.target.value)}
                  className="border rounded-lg px-3 py-2"
                  disabled={['returned', 'cancelled'].includes(selectedBooking.status)}
                >
                  <option value="pending">Chờ xác nhận</option>
                  <option value="confirmed">Đã xác nhận</option>
                  <option value="processing">Đang xử lý</option>
                  <option value="delivered">Đã giao</option>
                  <option value="returned">Đã trả</option>
                  <option value="cancelled">Hủy</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Booking Info */}
            <div className="space-y-4">
              <div className="bg-white border rounded-xl p-4">
                <h4 className="font-semibold text-gray-800 mb-3">📋 Thông tin đơn thuê</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Mã đơn:</span>
                    <span className="font-mono font-medium">{selectedBooking.id?.slice(-8).toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Ngày tạo:</span>
                    <span className="font-medium">
                      {new Date(selectedBooking.createdAt).toLocaleString('vi-VN')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Sản phẩm:</span>
                    <span className="font-medium">
                      {selectedBooking.productId?.name || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Hình thức:</span>
                    <span className="font-medium">
                      {selectedBooking.rentalType === 'hour'
                        ? `Theo giờ (${selectedBooking.rentalHours}h)`
                        : 'Theo ngày'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Ngày nhận:</span>
                    <span className="font-medium">
                      {new Date(selectedBooking.startDate).toLocaleString('vi-VN')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Ngày trả:</span>
                    <span className="font-medium">
                      {new Date(selectedBooking.endDate).toLocaleString('vi-VN')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Thời gian thuê:</span>
                    <span className="font-medium">{selectedBooking.rentalDays} ngày</span>
                  </div>
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold text-gray-800">Tổng tiền:</span>
                    <span className="font-bold text-blue-600">
                      {selectedBooking.totalPrice?.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white border rounded-xl p-4">
                <h4 className="font-semibold text-gray-800 mb-3">👤 Thông tin khách hàng</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Họ tên:</span>
                    <span className="font-medium">{selectedBooking.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">SĐT:</span>
                    <span className="font-medium">{selectedBooking.customerPhone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Email:</span>
                    <span className="font-medium">{selectedBooking.customerEmail || '-'}</span>
                  </div>
                  {selectedBooking.deliveryAddress && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Địa chỉ:</span>
                      <span className="font-medium text-right max-w-[200px]">{selectedBooking.deliveryAddress}</span>
                    </div>
                  )}
                  {selectedBooking.notes && (
                    <div className="pt-2 border-t mt-2">
                      <span className="text-gray-500 block mb-1">Ghi chú:</span>
                      <span className="font-medium text-orange-600">{selectedBooking.notes}</span>
                    </div>
                  )}
                </div>
              </div>

              {selectedBooking.staffNote && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <h4 className="font-semibold text-amber-800 mb-2">📝 Ghi chú nhân viên</h4>
                  <p className="text-sm text-amber-700">{selectedBooking.staffNote}</p>
                </div>
              )}
            </div>

            {/* Right Column - Identity Documents */}
            <div className="space-y-4">
              <div className="bg-white border rounded-xl p-4">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  🪪 Giấy tờ xác minh
                  {(docs.cccdFront || docs.cccdBack || docs.vneid || docs.selfie) && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                      ✓ Đã cung cấp
                    </span>
                  )}
                </h4>

                {(docs.cccdFront || docs.cccdBack || docs.vneid || docs.selfie) ? (
                  <div className="grid grid-cols-2 gap-3">
                    {docs.cccdFront && (
                      <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1">CCCD mặt trước</p>
                        <img
                          src={getImageUrl(docs.cccdFront)}
                          alt="CCCD mặt trước"
                          className="w-full h-32 object-cover rounded-lg border cursor-pointer hover:opacity-80"
                          onClick={() => window.open(getImageUrl(docs.cccdFront), '_blank')}
                        />
                      </div>
                    )}
                    {docs.cccdBack && (
                      <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1">CCCD mặt sau</p>
                        <img
                          src={getImageUrl(docs.cccdBack)}
                          alt="CCCD mặt sau"
                          className="w-full h-32 object-cover rounded-lg border cursor-pointer hover:opacity-80"
                          onClick={() => window.open(getImageUrl(docs.cccdBack), '_blank')}
                        />
                      </div>
                    )}
                    {docs.vneid && (
                      <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1">VNeID mức 2</p>
                        <img
                          src={getImageUrl(docs.vneid)}
                          alt="VNeID"
                          className="w-full h-32 object-cover rounded-lg border cursor-pointer hover:opacity-80"
                          onClick={() => window.open(getImageUrl(docs.vneid), '_blank')}
                        />
                      </div>
                    )}
                    {docs.selfie && (
                      <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1">Selfie cầm CCCD</p>
                        <img
                          src={getImageUrl(docs.selfie)}
                          alt="Selfie"
                          className="w-full h-32 object-cover rounded-lg border cursor-pointer hover:opacity-80"
                          onClick={() => window.open(getImageUrl(docs.selfie), '_blank')}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-400">
                    <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-sm">Không có giấy tờ xác minh</p>
                  </div>
                )}
              </div>

              {selectedBooking.paymentHistory?.length > 0 && (
                <div className="bg-white border rounded-xl p-4">
                  <h4 className="font-semibold text-gray-800 mb-3">💳 Thông tin thanh toán</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Số tiền:</span>
                      <span className="font-bold text-blue-600">
                        {selectedBooking.totalPrice?.toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Nội dung CK:</span>
                      <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">
                        {selectedBooking._id?.toString().slice(-10).toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý đơn thuê</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              autoRefresh
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Auto: {autoRefresh ? 'ON' : 'OFF'}
          </button>
          <button
            onClick={() => fetchBookings()}
            disabled={refreshing}
            className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {refreshing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Đang tải...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Làm mới</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="border rounded-lg px-4 py-2"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="pending">Chờ xác nhận</option>
            <option value="confirmed">Đã xác nhận</option>
            <option value="processing">Đang xử lý</option>
            <option value="delivered">Đã giao</option>
            <option value="returned">Đã trả</option>
            <option value="cancelled">Đã hủy</option>
          </select>

          <select
            value={filters.paymentStatus}
            onChange={(e) => setFilters({ ...filters, paymentStatus: e.target.value })}
            className="border rounded-lg px-4 py-2"
          >
            <option value="">Tất cả thanh toán</option>
            <option value="unpaid">Chưa thanh toán</option>
            <option value="paid">Đã thanh toán</option>
            <option value="partial">Thanh toán một phần</option>
          </select>

          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            className="border rounded-lg px-4 py-2"
          />
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            className="border rounded-lg px-4 py-2"
          />
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Đang tải danh sách đơn hàng...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-gray-500">Không có đơn hàng nào</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Mã đơn</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Khách hàng</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Sản phẩm</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Ngày thuê</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Tổng tiền</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Thanh toán</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Trạng thái</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => openDetailModal(booking)}>
                  <td className="px-4 py-3">
                    <span className="font-mono text-sm font-medium text-gray-900">
                      {booking.id?.slice(-8).toUpperCase() || 'N/A'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{booking.customerName}</div>
                    <div className="text-sm text-gray-500">{booking.customerPhone}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-gray-900">{booking.productId?.name || booking.product?.name || 'N/A'}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(booking.startDate).toLocaleDateString('vi-VN')} - {new Date(booking.endDate).toLocaleDateString('vi-VN')}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="text-sm">{new Date(booking.startDate).toLocaleDateString('vi-VN')}</div>
                    <div className="text-sm text-gray-500">→ {new Date(booking.endDate).toLocaleDateString('vi-VN')}</div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-semibold text-blue-600">
                      {booking.totalPrice?.toLocaleString('vi-VN')}đ
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {getPaymentBadge(booking.paymentStatus)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {getStatusBadge(booking.status)}
                  </td>
                  <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={booking.status}
                      onChange={(e) => updateStatus(booking.id, e.target.value)}
                      className="border rounded px-2 py-1 text-sm"
                      disabled={['returned', 'cancelled'].includes(booking.status)}
                    >
                      <option value="pending">Chờ xác nhận</option>
                      <option value="confirmed">Đã xác nhận</option>
                      <option value="processing">Đang xử lý</option>
                      <option value="delivered">Đã giao</option>
                      <option value="returned">Đã trả</option>
                      <option value="cancelled">Hủy</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary Stats */}
      <div className="mt-4 flex gap-4">
        <div className="bg-white rounded-lg shadow p-4 flex-1">
          <div className="text-sm text-gray-500">Tổng đơn</div>
          <div className="text-2xl font-bold text-gray-900">{bookings.length}</div>
        </div>
        <div className="bg-orange-50 rounded-lg shadow p-4 flex-1">
          <div className="text-sm text-orange-600">Chưa thanh toán</div>
          <div className="text-2xl font-bold text-orange-600">
            {bookings.filter(b => b.paymentStatus === 'unpaid').length}
          </div>
        </div>
        <div className="bg-green-50 rounded-lg shadow p-4 flex-1">
          <div className="text-sm text-green-600">Đã thanh toán</div>
          <div className="text-2xl font-bold text-green-600">
            {bookings.filter(b => b.paymentStatus === 'paid').length}
          </div>
        </div>
        <div className="bg-yellow-50 rounded-lg shadow p-4 flex-1">
          <div className="text-sm text-yellow-600">Chờ xác nhận</div>
          <div className="text-2xl font-bold text-yellow-600">
            {bookings.filter(b => b.status === 'pending').length}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && renderDetailModal()}
    </div>
  );
};

export default AdminBookings;
