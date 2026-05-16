import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/endpoints';

const GoogleSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loginWithToken } = useAuth();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const token = searchParams.get('token');
    const userId = searchParams.get('userId');

    if (!token || !userId) {
      navigate('/login?error=google_auth_failed');
      return;
    }

    const fetchUser = async () => {
      try {
        localStorage.setItem('token', token);
        const response = await authApi.getMe();
        const userData = response.data?.user || response.user;
        if (userData) {
          localStorage.setItem('user', JSON.stringify(userData));
          window.dispatchEvent(new Event('storage'));
          navigate('/');
        } else {
          navigate('/login?error=google_auth_failed');
        }
      } catch (error) {
        console.error('Google auth fetch user error:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login?error=google_auth_failed');
      }
    };

    fetchUser();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-400 text-lg">Đang đăng nhập với Google...</p>
      </div>
    </div>
  );
};

export default GoogleSuccess;
