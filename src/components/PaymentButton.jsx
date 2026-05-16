import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { paymentApi } from '../api/endpoints';

const PaymentButton = ({
  open,
  onClose,
  bookingId,
  amount,
  description,
  onSuccess,
  paymentType = 'deposit'
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [paymentMethod, setPaymentMethod] = useState('vnpay');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeStep, setActiveStep] = useState(0);

  // Listen for VNPay return
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const vnpayResult = params.get('vnpay');

    if (vnpayResult === 'success') {
      // VNPay returned successfully
      if (onSuccess) onSuccess();
    } else if (vnpayResult === 'failed') {
      const message = params.get('message') || 'Thanh toán thất bại';
      setError(message);
      setActiveStep(0);
    }
  }, [location.search, onSuccess]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const handleCreatePayment = async () => {
    try {
      setLoading(true);
      setError('');
      setActiveStep(1);

      const apiCall = paymentMethod === 'vnpay'
        ? paymentApi.createVNPayPayment({ bookingId, amount, description })
        : paymentApi.createPayment({ bookingId, amount, paymentMethod, paymentType, description });

      const response = await apiCall;

      console.log('Payment Response:', response);

      if (response.success) {
        if (paymentMethod === 'vnpay') {
          const paymentUrl = response.data?.paymentUrl;
          console.log('VNPay URL:', paymentUrl);

          if (paymentUrl) {
            // CRITICAL: DO NOT close modal here - user is leaving the page
            // Just redirect to VNPay
            setActiveStep(2);
            // Small delay to show "processing" state, then redirect
            setTimeout(() => {
              window.location.href = paymentUrl;
            }, 500);
          } else {
            setError('Không nhận được URL thanh toán VNPay');
            setActiveStep(0);
          }
        } else {
          setActiveStep(2);
        }
      } else {
        setError(response.message || 'Không thể tạo thanh toán');
        setActiveStep(0);
      }
    } catch (err) {
      setError('Lỗi kết nối server. Vui lòng thử lại.');
      console.error('Payment error:', err);
      setActiveStep(0);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setActiveStep(0);
    setPaymentMethod('vnpay');
    setError('');
    onClose();
  };

  const handlePaymentSuccess = () => {
    if (onSuccess) onSuccess();
    handleClose();
    navigate('/my-bookings');
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Dialog */}
      <div className="relative bg-gray-900 rounded-2xl w-full max-w-md mx-4 shadow-2xl border border-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-white">Thanh toán</h3>
            <span className="px-2 py-1 text-xs font-medium bg-blue-600 text-white rounded-full">
              {formatCurrency(amount)}
            </span>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Stepper */}
          <div className="flex items-center justify-between mb-4">
            <div className={`flex items-center gap-2 ${activeStep >= 0 ? 'text-blue-500' : 'text-gray-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                activeStep >= 0 ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'
              }`}>
                1
              </div>
              <span className="text-sm hidden sm:block">Chọn phương thức</span>
            </div>
            <div className="flex-1 h-1 mx-2 bg-gray-700 rounded">
              <div className={`h-full rounded transition-all ${
                activeStep >= 1 ? 'bg-blue-600 w-full' : 'w-0'
              }`} />
            </div>
            <div className={`flex items-center gap-2 ${activeStep >= 1 ? 'text-blue-500' : 'text-gray-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                activeStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'
              }`}>
                2
              </div>
              <span className="text-sm hidden sm:block">Thanh toán</span>
            </div>
            <div className="flex-1 h-1 mx-2 bg-gray-700 rounded">
              <div className={`h-full rounded transition-all ${
                activeStep >= 2 ? 'bg-blue-600 w-full' : 'w-0'
              }`} />
            </div>
            <div className={`flex items-center gap-2 ${activeStep >= 2 ? 'text-blue-500' : 'text-gray-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                activeStep >= 2 ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400'
              }`}>
                ✓
              </div>
              <span className="text-sm hidden sm:block">Hoàn tất</span>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center justify-between">
              <span className="text-red-400 text-sm">{error}</span>
              <button onClick={() => setError('')} className="text-red-400 hover:text-red-300">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Step 1: Select Payment Method */}
          {activeStep === 0 && (
            <div>
              <p className="text-gray-400 text-sm mb-4">
                Vui lòng chọn phương thức thanh toán phù hợp với bạn
              </p>

              <div className="space-y-3">
                {/* VNPay Option */}
                <div
                  onClick={() => setPaymentMethod('vnpay')}
                  className={`p-4 rounded-xl cursor-pointer border-2 transition-all ${
                    paymentMethod === 'vnpay'
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      paymentMethod === 'vnpay' ? 'bg-blue-500/30' : 'bg-gray-700'
                    }`}>
                      <svg className={`w-6 h-6 ${paymentMethod === 'vnpay' ? 'text-blue-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-white">Thanh toán qua VNPay</span>
                        <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded-full">Khuyến nghị</span>
                      </div>
                      <span className="text-gray-400 text-sm">Thanh toán bằng thẻ ATM/Visa/MasterCard</span>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === 'vnpay' ? 'border-blue-500' : 'border-gray-600'
                    }`}>
                      {paymentMethod === 'vnpay' && (
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                      )}
                    </div>
                  </div>
                </div>

                {/* COD Option */}
                <div
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-4 rounded-xl cursor-pointer border-2 transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      paymentMethod === 'cod' ? 'bg-blue-500/30' : 'bg-gray-700'
                    }`}>
                      <svg className={`w-6 h-6 ${paymentMethod === 'cod' ? 'text-blue-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <span className="font-semibold text-white">Thanh toán khi nhận hàng (COD)</span>
                      <p className="text-gray-400 text-sm">Trả tiền khi nhận được thiết bị</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === 'cod' ? 'border-blue-500' : 'border-gray-600'
                    }`}>
                      {paymentMethod === 'cod' && (
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="mt-4 p-4 bg-gray-800 rounded-xl border border-gray-700">
                <p className="text-sm font-medium text-gray-300 mb-2">Thông tin thanh toán</p>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Số tiền thanh toán</span>
                  <span className="font-bold text-white">{formatCurrency(amount)}</span>
                </div>
                {description && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Nội dung</span>
                    <span className="text-white">{description}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Payment Processing */}
          {activeStep === 1 && (
            <div className="text-center py-8">
              {loading ? (
                <>
                  <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-lg font-medium text-white">Đang tạo thanh toán...</p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-lg font-medium text-white">Đang chuyển đến trang thanh toán...</p>
                </>
              )}
            </div>
          )}

          {/* Step 3: Success */}
          {activeStep === 2 && (
            <div className="text-center py-8">
              <div className="w-20 h-20 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-green-400 mb-2">Đặt hàng thành công!</h3>
              <p className="text-gray-400 mb-4">
                Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ liên hệ xác nhận trong thời gian sớm nhất.
              </p>

              {paymentMethod === 'cod' && (
                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl text-left">
                  <p className="text-blue-400 font-medium mb-1">Thông tin thanh toán COD</p>
                  <p className="text-gray-300 text-sm">
                    Bạn sẽ thanh toán <strong>{formatCurrency(amount)}</strong> khi nhận được thiết bị.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 flex justify-end gap-3">
          {activeStep === 0 && (
            <>
              <button
                onClick={handleClose}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleCreatePayment}
                disabled={loading || !paymentMethod}
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {loading && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                {paymentMethod === 'vnpay' ? 'Thanh toán ngay' : 'Xác nhận đặt hàng'}
              </button>
            </>
          )}
          {activeStep === 2 && (
            <button
              onClick={handlePaymentSuccess}
              className="px-6 py-2 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-all"
            >
              Hoàn tất
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentButton;
