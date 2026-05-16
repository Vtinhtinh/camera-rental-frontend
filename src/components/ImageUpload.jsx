import { useState, useRef, useEffect } from 'react';
import { uploadApi } from '../api/endpoints';

const getImageUrl = (url) => url?.startsWith('http') ? url : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${url}`;

const ImageUpload = ({ value, onChange, label = 'Hình ảnh', aspectRatio = 'aspect-video' }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(value || '');
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);
  const dragCounterRef = useRef(0);

  // Update preview when value changes (e.g., when editing)
  useEffect(() => {
    if (value) {
      setPreviewUrl(value);
    }
  }, [value]);

  const handleFileSelect = async (file) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Chỉ chấp nhận file hình ảnh (JPEG, PNG, GIF, WEBP)');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File quá lớn. Kích thước tối đa là 5MB');
      return;
    }

    setError('');
    setUploading(true);

    try {
      const res = await uploadApi.uploadImage(file);
      if (res.success) {
        setPreviewUrl(res.data.url);
        onChange(res.data.url);
      } else {
        setError(res.message || 'Upload thất bại');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Không thể kết nối đến server');
    } finally {
      setUploading(false);
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setDragging(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    dragCounterRef.current = 0;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      handleFileSelect(file);
    }
  };

  const handleClick = () => {
    if (!uploading) {
      fileInputRef.current?.click();
    }
  };

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) handleFileSelect(file);
    // Reset input để cho phép chọn cùng file lại
    e.target.value = '';
  };

  const removeImage = (e) => {
    e.stopPropagation();
    setPreviewUrl('');
    onChange('');
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      )}

      <div
        ref={dropZoneRef}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`
          relative ${aspectRatio}
          rounded-xl overflow-hidden border-2 cursor-pointer transition-all
          ${dragging
            ? 'border-blue-500 bg-blue-50'
            : previewUrl
              ? 'border-gray-200'
              : 'border-dashed border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }
          ${uploading ? 'pointer-events-none opacity-70' : ''}
        `}
      >
        {previewUrl ? (
          <>
            <img
              src={getImageUrl(previewUrl)}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            {/* Overlay buttons */}
            <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                title="Đổi ảnh"
              >
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={removeImage}
                className="p-2 bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
                title="Xóa ảnh"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </>
        ) : uploading ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 font-medium">Đang tải lên...</p>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-gray-600 font-medium">
                {dragging ? 'Thả file vào đây' : 'Click hoặc kéo thả để tải ảnh lên'}
              </p>
              <p className="text-gray-400 text-sm mt-1">JPEG, PNG, GIF, WEBP (tối đa 5MB)</p>
            </div>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleChange}
        className="hidden"
      />

      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}
    </div>
  );
};

export default ImageUpload;
