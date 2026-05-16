import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/endpoints';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSendCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await authApi.forgotPassword({ email });
      setSuccess('Mã xác nhận đã được gửi đến email của bạn.');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể gửi mã. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      setLoading(false);
      return;
    }

    try {
      await authApi.verifyResetCode({ email, code });
      await authApi.resetPassword({ email, code, newPassword });
      setSuccess('Đặt lại mật khẩu thành công!');
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Mã xác nhận không hợp lệ hoặc đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-700">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">Quên mật khẩu</h1>
            <p className="text-gray-400 mt-2">
              {step === 1 && 'Nhập email để nhận mã xác nhận'}
              {step === 2 && 'Nhập mã xác nhận và mật khẩu mới'}
              {step === 3 && 'Mật khẩu đã được đặt lại'}
            </p>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500/20 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl mb-6">
              {success}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleSendCode} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-500"
                  placeholder="email@example.com"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/30"
              >
                {loading ? 'Đang gửi mã...' : 'Gửi mã xác nhận'}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyAndReset} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Mã xác nhận</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  maxLength={6}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white text-center text-xl tracking-widest focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-500"
                  placeholder="• • • • • •"
                />
                <p className="text-xs text-gray-500 mt-2 text-center">Mã có 6 chữ số, hết hạn sau 15 phút</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Mật khẩu mới</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-500"
                  placeholder="Ít nhất 6 ký tự"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Xác nhận mật khẩu</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-500"
                  placeholder="Nhập lại mật khẩu mới"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/30"
              >
                {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-gray-400 text-sm hover:text-gray-300 mt-2"
              >
                ← Gửi lại mã khác
              </button>
            </form>
          )}

          {step === 3 && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-gray-300">Mật khẩu của bạn đã được thay đổi thành công.</p>
              <Link
                to="/login"
                className="inline-block w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/30 text-center"
              >
                Đăng nhập ngay
              </Link>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Nhớ mật khẩu rồi?{' '}
              <Link to="/login" className="text-blue-400 font-semibold hover:text-blue-300">
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
