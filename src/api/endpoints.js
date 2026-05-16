import api from './axiosClient';

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  verifyResetCode: (data) => api.post('/auth/verify-reset-code', data),
  resetPassword: (data) => api.post('/auth/reset-password', data)
};

export const productApi = {
  getAll: (params) => api.get('/products', { params }),
  getFeatured: () => api.get('/products/featured'),
  getById: (id) => api.get(`/products/${id}`),
  getBrands: () => api.get('/products/brands'),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`)
};

export const bookingApi = {
  create: (data) => api.post('/bookings', data),
  getMyBookings: (params) => api.get('/bookings/my-bookings', { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  cancel: (id, reason) => api.put(`/bookings/${id}/cancel`, { reason })
};

export const adminBookingApi = {
  getAll: (params) => api.get('/bookings', { params }),
  updateStatus: (id, data) => api.put(`/bookings/${id}/status`, data),
  getStats: () => api.get('/bookings/stats/admin')
};

export const bannerApi = {
  getActive: (position) => api.get('/banners', { params: { position } }),
  getAll: (params) => api.get('/banners/all', { params }),
  create: (data) => api.post('/banners', data),
  update: (id, data) => api.put(`/banners/${id}`, data),
  delete: (id) => api.delete(`/banners/${id}`)
};

export const feedbackApi = {
  getAll: (params) => api.get('/feedback', { params }),
  getByProduct: (productId, params) => api.get(`/feedback/product/${productId}`, { params }),
  getFeatured: () => api.get('/feedback/featured'),
  create: (data) => api.post('/feedback', data)
};

export const adminProductApi = {
  getStats: () => api.get('/products/stats/admin')
};

export const userApi = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  getBookings: (id, params) => api.get(`/users/${id}/bookings`, { params }),
  getStats: () => api.get('/users/stats')
};

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const uploadApi = {
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return fetch(`${API_BASE}/upload/image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    }).then(res => res.json());
  }
};

export const paymentApi = {
  createPayment: (data) => api.post('/payments/create', data),
  createVNPayPayment: (data) => api.post('/payments/vnpay/create', data),
  createVietQRPayment: (data) => api.post('/payments', data),
  generateQR: (data) => api.post('/payments/generate-qr', data),
  getPaymentInfo: (paymentId) => api.get(`/payments/info/${paymentId}`),
  getPaymentByBooking: (bookingId) => api.get(`/payments/booking/${bookingId}`),
  confirmPayment: (paymentId, notes) => api.post(`/payments/confirm/${paymentId}`, { notes }),
  cancelPayment: (paymentId, reason) => api.post(`/payments/cancel/${paymentId}`, { reason }),
  getMyPayments: (params) => api.get('/payments/my-payments', { params }),
  getAllPayments: (params) => api.get('/payments/all', { params }),
  getAllVietQRPayments: (params) => api.get('/payments/vietqr/all', { params }),
  getPaymentStats: (params) => api.get('/payments/stats', { params })
};
