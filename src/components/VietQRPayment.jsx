import { useState, useEffect, useCallback } from 'react';
import { paymentApi } from '../api/endpoints';

const VietQRPayment = ({ bookingId, amount, existingPayment, onSuccess, onClose, open }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentData, setPaymentData] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [countdownInterval, setCountdownInterval] = useState(null);
  const [isExpired, setIsExpired] = useState(false);
  const [showInitialForm, setShowInitialForm] = useState(true);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setPaymentData(null);
      setError('');
      setIsExpired(false);
      setShowInitialForm(true);
      setLoading(false);
    }
  }, [open]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
    };
  }, [countdownInterval]);

  const formatCurrency = (value) => {
    if (!value) return '0đ';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(parseInt(value));
  };

  const getCountdownColor = () => {
    if (countdown <= 60) return 'text-red-300';
    if (countdown <= 180) return 'text-yellow-200';
    return 'text-green-100';
  };

  const getHeaderGradient = () => {
    if (isExpired || countdown <= 60) return 'from-red-600 to-red-700';
    if (countdown <= 180) return 'from-orange-600 to-orange-700';
    return 'from-green-600 to-green-700';
  };

  const clearCountdown = useCallback(() => {
    if (countdownInterval) {
      clearInterval(countdownInterval);
      setCountdownInterval(null);
    }
  }, [countdownInterval]);

  const startCountdown = useCallback((expiresAt) => {
    if (!expiresAt) return;
    clearCountdown();
    const updateCountdown = () => {
      const expTime = new Date(expiresAt).getTime();
      const diff = expTime - Date.now();
      if (diff <= 0) {
        setCountdown(0);
        setIsExpired(true);
        setError('Mã thanh toán đã hết hạn');
        clearCountdown();
        return;
      }
      setCountdown(Math.floor(diff / 1000));
      setIsExpired(false);
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    setCountdownInterval(interval);
  }, [clearCountdown]);

  const createNewPayment = async () => {
    if (!bookingId || !amount) {
      setError('Thiếu thông tin đơn hàng hoặc số tiền');
      return;
    }
    setLoading(true);
    setError('');
    setShowInitialForm(false);
    try {
      const response = await paymentApi.createVietQRPayment({ bookingId, amount });
      if (response.success && response.data) {
        const payment = response.data;
        setPaymentData({
          id: payment.paymentId,
          amount: payment.amount,
          status: 'pending',
          expiresAt: payment.expiresAt,
          transferContent: payment.transferContent,
          qrUrl: payment.qrUrl,
          bankInfo: payment.bankInfo
        });
        startCountdown(payment.expiresAt);
      } else {
        setError(response.message || 'Không thể tạo mã thanh toán');
        setShowInitialForm(true);
      }
    } catch (err) {
      console.error('VietQR Payment Error:', err);
      setError(err.response?.data?.message || err.message || 'Đã xảy ra lỗi khi tạo thanh toán');
      setShowInitialForm(true);
    } finally {
      setLoading(false);
    }
  };

  const handleTryAgain = () => {
    setError('');
    setIsExpired(false);
    createNewPayment();
  };

  const handleClose = () => {
    clearCountdown();
    if (onClose) onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const handleSuccess = () => {
    if (onSuccess) onSuccess(paymentData);
    handleClose();
  };

  // If not open, return null
  if (!open) return null;

  // Initial form
  if (showInitialForm && !paymentData) {
    return (
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={handleBackdropClick}
        style={{ display: 'flex' }}
      >
        <div className="bg-gray-900 rounded-2xl max-w-sm w-full border border-gray-800 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-green-700 p-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Thanh toán VietQR</h2>
              <p className="text-green-100 text-sm">Quét mã QR để thanh toán</p>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-4 space-y-4">
            <div className="bg-gray-800 rounded-xl p-3 text-center">
              <p className="text-gray-400 text-xs">Số tiền thanh toán</p>
              <p className="text-2xl font-bold text-green-400">{formatCurrency(amount)}</p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              onClick={createNewPayment}
              disabled={loading}
              className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all"
            >
              {loading ? 'Đang tạo mã QR...' : 'Tạo mã QR thanh toán'}
            </button>

            <button
              onClick={handleClose}
              className="w-full py-2 text-gray-400 hover:text-white transition-colors text-sm"
            >
              Hủy
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" style={{ display: 'flex' }}>
        <div className="bg-gray-900 rounded-2xl max-w-sm w-full border border-gray-800 overflow-hidden p-6 text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white font-medium">Đang tạo mã thanh toán...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !paymentData) {
    return (
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={handleBackdropClick}
        style={{ display: 'flex' }}
      >
        <div className="bg-gray-900 rounded-2xl max-w-sm w-full border border-gray-800 overflow-hidden">
          <div className="bg-gradient-to-r from-red-600 to-red-700 p-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Lỗi thanh toán</h2>
            <button
              onClick={handleClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-4 space-y-4">
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
            <button
              onClick={createNewPayment}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-all"
            >
              Thử lại
            </button>
            <button
              onClick={handleClose}
              className="w-full py-2 text-gray-400 hover:text-white transition-colors text-sm"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    );
  }

  // QR Payment state
  const headerGradient = getHeaderGradient();
  const countdownColor = getCountdownColor();

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
      style={{ display: 'flex' }}
    >
      <div className="bg-gray-900 rounded-2xl max-w-sm w-full border border-gray-800 overflow-hidden max-h-[90vh]">
        <div className={`bg-gradient-to-r ${headerGradient} p-3 flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            {isExpired ? (
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            )}
            <span className="text-white font-semibold">
              {isExpired ? 'Mã QR hết hạn' : 'Quét mã QR'}
            </span>
          </div>
          <button
            onClick={handleClose}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="px-3 text-center">
          {!isExpired && (
            <p className={`text-xs ${countdownColor}`}>
              Hết hạn: <span className="font-mono font-bold">{Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}</span>
            </p>
          )}
          {isExpired && (
            <p className="text-red-200 text-xs">Vui lòng tạo mã mới để tiếp tục</p>
          )}
        </div>

        <div className="p-4 space-y-3 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* QR Code */}
          <div className="bg-white rounded-xl p-3 flex items-center justify-center">
            <img
              src={paymentData.qrUrl}
              alt="VietQR Code"
              className="w-48 h-48 object-contain"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>

          {/* Amount */}
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 text-center">
            <p className="text-gray-400 text-xs">Số tiền</p>
            <p className="text-xl font-bold text-green-400">{formatCurrency(paymentData.amount)}</p>
          </div>

          {/* Bank Info */}
          <div className="bg-gray-800 rounded-xl p-3">
            <span className="text-gray-400 text-sm flex items-center gap-1 mb-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
              </svg>
              Tài khoản
            </span>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Ngân hàng</span>
                <span className="text-white font-medium">{paymentData.bankInfo?.bankName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Số TK</span>
                <div className="flex items-center gap-2">
                  <span className="text-white font-mono text-xs">{paymentData.bankInfo?.accountNumber}</span>
                  <button onClick={() => copyToClipboard(paymentData.bankInfo?.accountNumber)} className="p-1 text-gray-400 hover:text-white">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tên</span>
                <span className="text-white">{paymentData.bankInfo?.accountName}</span>
              </div>
            </div>
          </div>

          {/* Transfer Content */}
          <div className="bg-gradient-to-r from-blue-600/20 to-blue-700/20 border border-blue-500/30 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-blue-400 text-xs font-medium">Nội dung CK</span>
              <button onClick={() => copyToClipboard(paymentData.transferContent)} className="p-1 text-blue-400 hover:text-blue-300">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
            <p className="text-white font-mono font-bold text-center bg-gray-800 px-3 py-2 rounded-lg">
              {paymentData.transferContent}
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-2 pt-2">
            {!isExpired && (
              <button
                onClick={handleSuccess}
                className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-all text-sm"
              >
                Tôi đã thanh toán
              </button>
            )}
            <button
              onClick={handleTryAgain}
              className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl transition-all text-sm"
            >
              {isExpired ? 'Tạo mã thanh toán mới' : 'Tạo mã mới'}
            </button>
            <button
              onClick={handleClose}
              className="w-full py-2 text-gray-400 hover:text-white transition-colors text-sm"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VietQRPayment;
