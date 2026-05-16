import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { uploadApi } from '../api/endpoints';

const STEPS = [
  { id: 1, title: 'Ngày thuê', icon: '📅' },
  { id: 2, title: 'Giá dự kiến', icon: '💰' },
  { id: 3, title: 'Thông tin cá nhân', icon: '👤' },
  { id: 4, title: 'Xác minh danh tính', icon: '🪪' },
  { id: 5, title: 'Xác nhận', icon: '✅' }
];

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getImageUrl = (url) => url?.startsWith('http') ? url : `${API_BASE.replace('/api', '')}${url}`;

const BookingModal = ({ product, onClose }) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [rentalType, setRentalType] = useState('day');
  const [selectedHours, setSelectedHours] = useState(3);
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    customerName: user?.name || '',
    customerPhone: '',
    customerEmail: user?.email || '',
    notes: ''
  });

  // Identity documents
  const [documents, setDocuments] = useState({
    cccdFront: '',
    cccdBack: '',
    vneid: '',
    selfie: ''
  });

  const [uploadingDoc, setUploadingDoc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Calculate price preview
  const calculatePrice = useCallback(() => {
    if (!product?.pricing) return 0;

    if (rentalType === 'hour') {
      if (selectedHours === 3) return product.pricing.price3h || 0;
      if (selectedHours === 6) return product.pricing.price6h || 0;
      if (selectedHours === 12) return product.pricing.price12h || 0;
    } else if (rentalType === 'day' && formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const hoursDiff = Math.ceil((end - start) / (1000 * 60 * 60));

      if (hoursDiff <= 6) return product.pricing.price6h || 0;
      if (hoursDiff <= 12) return product.pricing.price12h || 0;

      const days = Math.ceil(hoursDiff / 24);
      if (days === 1) return product.pricing.price1d || 0;
      if (days === 2) return product.pricing.price2d || 0;
      return (product.pricing.price3dPlus || 0) * days;
    }
    return 0;
  }, [product, rentalType, selectedHours, formData.startDate, formData.endDate]);

  // Validate current step
  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (rentalType === 'hour') {
          return !!formData.startDate;
        }
        return !!formData.startDate && !!formData.endDate;
      case 2:
        return calculatePrice() > 0;
      case 3:
        return !!formData.customerName && !!formData.customerPhone;
      case 4:
        return documents.cccdFront && documents.cccdBack && documents.vneid && documents.selfie;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleRentalTypeChange = (type) => {
    setRentalType(type);
    setFormData(prev => ({
      ...prev,
      startDate: '',
      endDate: ''
    }));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Upload document
  const handleUploadDocument = async (type, file) => {
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Chỉ chấp nhận file hình ảnh (JPEG, PNG, GIF, WEBP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File quá lớn. Kích thước tối đa là 5MB');
      return;
    }

    setError('');
    setUploadingDoc(type);

    try {
      const res = await uploadApi.uploadImage(file);
      if (res.success) {
        setDocuments(prev => ({
          ...prev,
          [type]: res.data.url
        }));
      } else {
        setError(res.message || 'Upload thất bại');
      }
    } catch (err) {
      setError('Không thể kết nối đến server');
    } finally {
      setUploadingDoc(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        ...formData,
        productId: product.id,
        rentalType,
        identityDocuments: documents,
        hours: rentalType === 'hour' ? selectedHours : undefined
      };

      const response = await fetch(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        const booking = data.data?.booking;
        const bookingId = booking?.id || booking?._id;
        setTimeout(() => {
          onClose();
          if (bookingId) {
            navigate(`/payment?bookingId=${bookingId}`);
          } else {
            navigate('/my-bookings');
          }
        }, 2000);
      } else {
        setError(data.message || 'Đã xảy ra lỗi');
      }
    } catch (err) {
      setError('Không thể kết nối đến server');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-6 max-w-md w-full text-center">
          <h3 className="text-xl font-semibold mb-4">Yêu cầu đăng nhập</h3>
          <p className="text-gray-600 mb-6">Bạn cần đăng nhập để đặt thuê máy ảnh.</p>
          <div className="flex gap-4">
            <button onClick={onClose} className="flex-1 py-2 border rounded-lg">Hủy</button>
            <button onClick={() => navigate('/login')} className="flex-1 py-2 bg-blue-600 text-white rounded-lg">Đăng nhập</button>
          </div>
        </div>
      </div>
    );
  }

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-6">
      {STEPS.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div className={`
            w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all
            ${currentStep > step.id
              ? 'bg-green-500 text-white'
              : currentStep === step.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-500'
            }
          `}>
            {currentStep > step.id ? '✓' : step.icon}
          </div>
          {index < STEPS.length - 1 && (
            <div className={`w-8 h-0.5 mx-1 ${
              currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  const renderStepTitle = () => (
    <div className="text-center mb-4">
      <h3 className="text-lg font-semibold text-gray-800">
        Bước {currentStep}: {STEPS[currentStep - 1]?.title}
      </h3>
      <p className="text-sm text-gray-500">
        {STEPS[currentStep - 1]?.icon} {STEPS[currentStep - 1]?.title}
      </p>
    </div>
  );

  const renderDocumentUpload = (type, label, description) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className={`
        relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all
        ${documents[type]
          ? 'border-green-400 bg-green-50'
          : uploadingDoc === type
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        }
      `}>
        {documents[type] ? (
          <div className="relative">
            <img
              src={getImageUrl(documents[type])}
              alt={label}
              className="max-h-40 mx-auto rounded-lg object-contain"
            />
            <button
              type="button"
              onClick={() => setDocuments(prev => ({ ...prev, [type]: '' }))}
              className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
            >
              ✕
            </button>
            <p className="mt-2 text-sm text-green-600 font-medium">✓ Đã tải lên</p>
          </div>
        ) : uploadingDoc === type ? (
          <div className="py-4">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="mt-2 text-sm text-blue-600">Đang tải lên...</p>
          </div>
        ) : (
          <label className="cursor-pointer">
            <div className="py-4">
              <svg className="w-10 h-10 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-600 font-medium">{label}</p>
              <p className="text-xs text-gray-400 mt-1">{description}</p>
            </div>
            <input
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="hidden"
              onChange={(e) => handleUploadDocument(type, e.target.files[0])}
            />
          </label>
        )}
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Date selection
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Hình thức thuê</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleRentalTypeChange('day')}
                  className={`py-3 rounded-lg font-medium transition-all ${
                    rentalType === 'day'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  📅 Theo ngày
                </button>
                <button
                  type="button"
                  onClick={() => handleRentalTypeChange('hour')}
                  className={`py-3 rounded-lg font-medium transition-all ${
                    rentalType === 'hour'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ⏰ Theo giờ
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {rentalType === 'hour' ? 'Ngày & giờ nhận máy *' : 'Ngày nhận máy *'}
              </label>
              <input
                type={rentalType === 'hour' ? 'datetime-local' : 'date'}
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                min={rentalType === 'hour' ? new Date().toISOString().slice(0, 16) : getMinDate()}
                required
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {rentalType === 'day' && (
              <div>
                <label className="block text-sm font-medium mb-1">Ngày trả máy *</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  min={formData.startDate || getMinDate()}
                  required
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {rentalType === 'hour' && (
              <div>
                <label className="block text-sm font-medium mb-2">Thời gian thuê</label>
                <div className="grid grid-cols-3 gap-2">
                  {[3, 6, 12].map((hours) => (
                    <button
                      key={hours}
                      type="button"
                      onClick={() => setSelectedHours(hours)}
                      className={`py-3 rounded-lg font-medium transition-all flex flex-col items-center ${
                        selectedHours === hours
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <span className="text-lg font-bold">{hours}h</span>
                      <span className="text-xs opacity-80">
                        {hours === 3 && product.pricing?.price3h ? `${product.pricing.price3h.toLocaleString()}đ` : '-'}
                        {hours === 6 && product.pricing?.price6h ? `${product.pricing.price6h.toLocaleString()}đ` : '-'}
                        {hours === 12 && product.pricing?.price12h ? `${product.pricing.price12h.toLocaleString()}đ` : '-'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 2: // Price preview
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-4">Chi tiết thuê</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Sản phẩm:</span>
                  <span className="font-medium">{product?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Hình thức:</span>
                  <span className="font-medium">{rentalType === 'day' ? 'Theo ngày' : `Theo giờ (${selectedHours}h)`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ngày nhận:</span>
                  <span className="font-medium">
                    {rentalType === 'hour'
                      ? new Date(formData.startDate).toLocaleString('vi-VN')
                      : new Date(formData.startDate).toLocaleDateString('vi-VN')
                    }
                  </span>
                </div>
                {rentalType === 'day' && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ngày trả:</span>
                    <span className="font-medium">{new Date(formData.endDate).toLocaleDateString('vi-VN')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Thời gian:</span>
                  <span className="font-medium">
                    {rentalType === 'hour'
                      ? `${selectedHours} tiếng`
                      : `${Math.ceil((new Date(formData.endDate) - new Date(formData.startDate)) / (1000 * 60 * 60 * 24))} ngày`
                    }
                  </span>
                </div>
                <hr className="border-blue-200" />
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-blue-800">Giá thuê dự kiến:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {calculatePrice().toLocaleString()}đ
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
              <p className="text-sm text-amber-800">
                💡 <strong>Lưu ý:</strong> Giá trên chưa bao gồm tiền đặt cọc. Tiền đặt cọc sẽ được thông báo khi admin duyệt đơn.
              </p>
            </div>
          </div>
        );

      case 3: // Personal info
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Họ tên *</label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập họ tên đầy đủ"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Số điện thoại *</label>
              <input
                type="tel"
                name="customerPhone"
                value={formData.customerPhone}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="0xxx xxx xxx"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                name="customerEmail"
                value={formData.customerEmail}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ghi chú</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Yêu cầu đặc biệt, địa chỉ giao hàng..."
              />
            </div>
          </div>
        );

      case 4: // Identity documents
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 mb-4">
              <p className="text-sm text-blue-800">
                📋 <strong>Yêu cầu xác minh danh tính:</strong><br/>
                Để đảm bảo an toàn, vui lòng cung cấp các giấy tờ sau:
              </p>
            </div>
            {renderDocumentUpload('cccdFront', 'CCCD mặt trước', 'Chụp rõ mặt trước CCCD/CMND')}
            {renderDocumentUpload('cccdBack', 'CCCD mặt sau', 'Chụp rõ mặt sau CCCD/CMND')}
            {renderDocumentUpload('vneid', 'Ảnh VNeID mức 2', 'Chụp màn hình app VNeID mức 2')}
            {renderDocumentUpload('selfie', 'Ảnh selfie cầm CCCD', 'Chụp ảnh chân dung cầm CCCD')}
          </div>
        );

      case 5: // Confirmation
        return (
          <div className="space-y-4">
            <div className="bg-green-50 rounded-xl p-4 border border-green-200 mb-4">
              <p className="text-sm text-green-800">
                ✅ Vui lòng kiểm tra thông tin trước khi xác nhận đặt thuê.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-3">📅 Thông tin thuê</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Sản phẩm:</span>
                  <span className="font-medium">{product?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Ngày nhận:</span>
                  <span className="font-medium">
                    {rentalType === 'hour'
                      ? new Date(formData.startDate).toLocaleString('vi-VN')
                      : new Date(formData.startDate).toLocaleDateString('vi-VN')
                    }
                  </span>
                </div>
                {rentalType === 'day' && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Ngày trả:</span>
                    <span className="font-medium">{new Date(formData.endDate).toLocaleDateString('vi-VN')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Giá thuê:</span>
                  <span className="font-bold text-blue-600">{calculatePrice().toLocaleString()}đ</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-3">👤 Thông tin cá nhân</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Họ tên:</span>
                  <span className="font-medium">{formData.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">SĐT:</span>
                  <span className="font-medium">{formData.customerPhone}</span>
                </div>
                {formData.customerEmail && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Email:</span>
                    <span className="font-medium">{formData.customerEmail}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-3">🪪 Giấy tờ xác minh</h4>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'cccdFront', label: 'CCCD trước' },
                  { key: 'cccdBack', label: 'CCCD sau' },
                  { key: 'vneid', label: 'VNeID' },
                  { key: 'selfie', label: 'Selfie' }
                ].map(doc => (
                  <div key={doc.key} className="text-center">
                    <img
                      src={getImageUrl(documents[doc.key])}
                      alt={doc.label}
                      className="w-full h-20 object-cover rounded-lg border border-gray-200"
                    />
                    <p className="text-xs text-gray-500 mt-1">{doc.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Đặt thuê: {product?.name}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-green-600 mb-2">Đặt thuê thành công!</h4>
            <p className="text-gray-600">Bạn sẽ được chuyển đến trang thanh toán...</p>
          </div>
        ) : (
          <>
            {renderStepIndicator()}
            {renderStepTitle()}

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={currentStep === 5 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>
              {renderStepContent()}

              <div className="flex gap-4 mt-6">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 py-3 border rounded-xl font-medium hover:bg-gray-50 transition-colors"
                  >
                    ← Quay lại
                  </button>
                )}
                {currentStep < 5 ? (
                  <button
                    type="submit"
                    disabled={!validateStep(currentStep)}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Tiếp tục →
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Đang xử lý...' : '✓ Xác nhận đặt thuê'}
                  </button>
                )}
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default BookingModal;
