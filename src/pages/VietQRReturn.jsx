import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { bookingApi } from '../api/endpoints';

const VietQRReturn = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);

  const bookingId = searchParams.get('bookingId');
  const paymentId = searchParams.get('paymentId');
  const confirmed = searchParams.get('confirmed');

  useEffect(() => {
    const fetchBooking = async () => {
      if (bookingId) {
        try {
          const res = await bookingApi.getById(bookingId);
          if (res.success && res.data?.booking) {
            setBooking(res.data.booking);
          }
        } catch (error) {
          console.error('Error fetching booking:', error);
        }
      }
      setLoading(false);
    };

    fetchBooking();
  }, [bookingId]);

  const formatCurrency = (amount) => {
    if (!amount) return '0đ';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto py-12 px-4">
        <div className="flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400">Đang xử lý...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        {/* Header - Success */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 p-8 text-center">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            {confirmed === 'true' ? 'Đã xác nhận!' : 'Chờ xác nhận thanh toán'}
          </h1>
          <p className="text-green-100">
            {confirmed === 'true'
              ? 'Thanh toán của bạn đã được xác nhận'
              : 'Admin đang kiểm tra và xác nhận thanh toán của bạn'}
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Booking Info */}
          {booking && (
            <div className="bg-gray-800 rounded-xl p-4 mb-6">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Thông tin đơn hàng
              </h3>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Mã đơn</span>
                  <span className="text-white font-mono">
                    {booking.id?.slice(-8).toUpperCase() || booking._id?.slice(-8).toUpperCase()}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Sản phẩm</span>
                  <span className="text-white">{booking.productId?.name || 'N/A'}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Ngày thuê</span>
                  <span className="text-white">
                    {new Date(booking.startDate).toLocaleDateString('vi-VN')}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Ngày trả</span>
                  <span className="text-white">
                    {new Date(booking.endDate).toLocaleDateString('vi-VN')}
                  </span>
                </div>

                <div className="flex justify-between pt-2 border-t border-gray-700">
                  <span className="text-gray-400">Tổng tiền</span>
                  <span className="text-white font-bold">{formatCurrency(booking.totalPrice)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Thanh toán</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    booking.paymentStatus === 'paid'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    {booking.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Trạng thái đơn</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {booking.status === 'confirmed' ? 'Đã xác nhận' :
                     booking.status === 'pending' ? 'Chờ xác nhận' : booking.status}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Info Message */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
            <h4 className="text-blue-400 font-semibold mb-2 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Thông báo
            </h4>
            <ul className="text-gray-300 text-sm space-y-1">
              <li>• Sau khi admin xác nhận thanh toán, đơn hàng sẽ được tự động cập nhật</li>
              <li>• Bạn sẽ nhận được thông báo qua Telegram (nếu đã cài đặt)</li>
              <li>• Thời gian xác nhận: trong vòng 24h làm việc</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Link
              to="/my-bookings"
              className="block w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl text-center transition-colors"
            >
              Xem đơn hàng của tôi
            </Link>

            <Link
              to="/"
              className="block w-full py-3 border border-gray-700 text-gray-300 hover:bg-gray-800 rounded-xl text-center transition-colors"
            >
              Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VietQRReturn;
