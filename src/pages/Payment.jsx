import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import PaymentButton from '../components/PaymentButton';
import VietQRPayment from '../components/VietQRPayment';
import { bookingApi } from '../api/endpoints';

const Payment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const bookingId = searchParams.get('bookingId');

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [vietqrDialogOpen, setVietqrDialogOpen] = useState(false);

  useEffect(() => {
    if (!bookingId) {
      setError('Không có thông tin đơn hàng (missing bookingId)');
      setLoading(false);
      return;
    }

    bookingApi.getById(bookingId)
      .then(res => {
        console.log('API Response:', res);
        if (res.success && res.data?.booking) {
          setBooking(res.data.booking);
        } else {
          setError('Không tìm thấy đơn hàng. Response: ' + JSON.stringify(res));
        }
      })
      .catch(err => {
        console.error('Booking API Error:', err);
        if (err.status === 401) {
          setError('Vui lòng đăng nhập lại (401)');
        } else if (err.status === 403) {
          setError('Bạn không có quyền xem đơn hàng này (403)');
        } else {
          setError('Lỗi ' + (err.status || '') + ': ' + (err.message || 'Không thể tải đơn hàng'));
        }
      })
      .finally(() => setLoading(false));
  }, [bookingId]);

  const formatCurrency = (amount) => {
    if (!amount) return '0đ';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(parseInt(amount));
  };

  const getBookingId = (booking) => booking.id || booking._id;

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4">
        <div className="flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400">Đang tải thông tin thanh toán...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4">
        <div className="bg-gray-900 rounded-2xl p-8 text-center border border-gray-800">
          <div className="w-20 h-20 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-red-400 mb-2">Đã xảy ra lỗi</h2>
          <p className="text-gray-400 mb-6">{error || 'Không thể tải thông tin đơn hàng'}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
        >
          ← Quay lại
        </button>
        <h1 className="text-2xl font-bold text-white">Thanh toán đơn hàng</h1>
      </div>

      {/* Order Info Card */}
      <div className="bg-gray-900 rounded-2xl p-6 mb-6 border border-gray-800">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h2 className="text-lg font-semibold text-white">Thông tin đơn hàng</h2>
        </div>

        <div className="border-t border-gray-800 pt-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-400">Mã đơn hàng</span>
            <span className="font-semibold text-white">{getBookingId(booking)?.slice(-8).toUpperCase() || 'N/A'}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">Sản phẩm</span>
            <span className="text-white">{booking.productId?.name || booking.product?.name || booking.productName || 'N/A'}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">Ngày thuê</span>
            <span className="text-white">
              {booking.startDate ? new Date(booking.startDate).toLocaleDateString('vi-VN') : 'N/A'}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">Ngày trả</span>
            <span className="text-white">
              {booking.endDate ? new Date(booking.endDate).toLocaleDateString('vi-VN') : 'N/A'}
            </span>
          </div>

          <div className="flex justify-between pt-2 border-t border-gray-800">
            <span className="text-gray-400">Tổng tiền</span>
            <span className="font-bold text-lg text-white">{booking.totalPrice?.toLocaleString()}đ</span>
          </div>
        </div>
      </div>

      {/* Payment Amount Card */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 mb-6">
        <p className="text-blue-100 mb-2">Số tiền cần thanh toán</p>
        <p className="text-4xl font-bold text-white mb-2">{formatCurrency(booking.totalPrice)}</p>
        <p className="text-blue-100 text-sm">Thanh toán đơn hàng {getBookingId(booking)?.slice(-8).toUpperCase()}</p>
      </div>

      {/* Payment Methods */}
      {booking.status === 'confirmed' ? (
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-green-400 mb-2">Thanh toán đã hoàn tất!</h2>
          <p className="text-gray-400 mb-4">Đơn hàng của bạn đã được xác nhận. Chúng tôi sẽ liên hệ sớm.</p>
        </div>
      ) : booking.paymentStatus === 'paid' ? (
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-green-400 mb-2">Đơn hàng đã thanh toán!</h2>
          <p className="text-gray-400 mb-4">Cảm ơn bạn đã thanh toán. Đơn hàng đang được xử lý.</p>
        </div>
      ) : (
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <h2 className="text-lg font-semibold text-white">Chọn phương thức thanh toán</h2>
          </div>

          <div className="space-y-4">
            {/* VietQR */}
            <div
              onClick={() => setVietqrDialogOpen(true)}
              className="bg-gray-800 rounded-xl p-4 cursor-pointer hover:border-green-500 border border-gray-700 transition-all hover:shadow-lg hover:shadow-green-500/10"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-white">Quét VietQR</h3>
                    <span className="px-2 py-0.5 text-xs font-medium bg-blue-500/20 text-blue-400 rounded-full">Miễn phí</span>
                  </div>
                  <p className="text-gray-400 text-sm">Quét mã QR để thanh toán qua ngân hàng</p>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            {/* VNPay */}
            <div
              onClick={() => setPaymentDialogOpen(true)}
              className="bg-gray-800 rounded-xl p-4 cursor-pointer hover:border-blue-500 border border-gray-700 transition-all hover:shadow-lg hover:shadow-blue-500/10"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-white">Thanh toán qua VNPay</h3>
                    <span className="px-2 py-0.5 text-xs font-medium bg-green-500/20 text-green-400 rounded-full">Khuyến nghị</span>
                  </div>
                  <p className="text-gray-400 text-sm">Thanh toán bằng thẻ ATM/Visa/MasterCard qua cổng VNPay</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-between">
        <Link
          to="/my-bookings"
          className="px-6 py-3 border border-gray-700 text-gray-300 rounded-xl hover:bg-gray-800 hover:border-gray-600 transition-all"
        >
          Xem đơn hàng của tôi
        </Link>
        <Link
          to="/"
          className="px-6 py-3 text-gray-400 hover:text-white transition-colors"
        >
          Về trang chủ
        </Link>
      </div>

      <PaymentButton
        open={paymentDialogOpen}
        onClose={() => setPaymentDialogOpen(false)}
        bookingId={bookingId}
        amount={booking.totalPrice || 0}
        description={`Thanh toan don hang ${getBookingId(booking)?.slice(-8).toUpperCase() || ''}`}
        onSuccess={() => navigate('/my-bookings')}
      />

      <VietQRPayment
        open={vietqrDialogOpen}
        onClose={() => setVietqrDialogOpen(false)}
        bookingId={bookingId}
        amount={booking.totalPrice || 0}
        existingPayment={booking.paymentHistory?.[0]}
        onSuccess={() => navigate('/my-bookings')}
      />
    </div>
  );
};

export default Payment;
