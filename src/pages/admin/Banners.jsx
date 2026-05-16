import { useState, useEffect } from 'react';
import { bannerApi } from '../../api/endpoints';
import ImageUpload from '../../components/ImageUpload';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const AdminBanners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [formData, setFormData] = useState({
    title: '', subtitle: '', image: '', link: '', buttonText: 'Xem ngay',
    position: 'main', order: 0, isActive: true
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const res = await bannerApi.getAll();
      setBanners(res.data.banners || []);
    } catch (error) {
      console.error('Error fetching banners:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.image) {
      alert('Vui lòng thêm hình ảnh cho banner!');
      return;
    }
    
    try {
      if (editingBanner) {
        await bannerApi.update(editingBanner.id, formData);
      } else {
        await bannerApi.create(formData);
      }
      setShowModal(false);
      setEditingBanner(null);
      fetchBanners();
    } catch (error) {
      console.error('Error:', error);
      alert(error?.response?.data?.message || error?.message || 'Có lỗi xảy ra khi lưu banner!');
    }
  };

  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title, subtitle: banner.subtitle || '', image: banner.image || '',
      link: banner.link || '', buttonText: banner.buttonText || 'Xem ngay',
      position: banner.position, order: banner.order, isActive: banner.isActive
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa banner này?')) return;
    try {
      await bannerApi.delete(id);
      fetchBanners();
    } catch (error) {
      console.error('Delete error:', error);
      alert(error?.response?.data?.message || error?.message || 'Có lỗi xảy ra khi xóa banner!');
    }
  };

  const openAddModal = () => {
    setEditingBanner(null);
    setFormData({ title: '', subtitle: '', image: '', link: '', buttonText: 'Xem ngay', position: 'main', order: 0, isActive: true });
    setShowModal(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Quản lý Banner</h1>
        <button onClick={openAddModal} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          + Thêm Banner
        </button>
      </div>

      {loading ? (
        <div className="animate-pulse">Loading...</div>
      ) : banners.length === 0 ? (
        <div className="bg-white rounded-xl p-16 text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa có banner nào</h3>
          <p className="text-gray-500 mb-6">Bắt đầu thêm banner đầu tiên cho website của bạn</p>
          <button onClick={openAddModal} className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
            Thêm banner đầu tiên
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((banner) => (
            <div key={banner.id} className="bg-white rounded-xl shadow-md overflow-hidden group">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={banner.image.startsWith('http') ? banner.image : `${API_BASE}${banner.image}`} 
                  alt={banner.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                />
                <div className="absolute top-3 right-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    banner.isActive ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                  }`}>
                    {banner.isActive ? 'Hoạt động' : 'Tắt'}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1">{banner.title}</h3>
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{banner.subtitle}</p>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-400">Vị trí: {banner.position}</span>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(banner)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Sửa</button>
                    <button onClick={() => handleDelete(banner.id)} className="text-red-600 hover:text-red-800 text-sm font-medium">Xóa</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">{editingBanner ? 'Sửa Banner' : 'Thêm Banner mới'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tiêu đề *</label>
                <input 
                  type="text" 
                  value={formData.title} 
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                  required 
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" 
                  placeholder="VD: Khuyến mãi mùa hè"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phụ đề</label>
                <input 
                  type="text" 
                  value={formData.subtitle} 
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })} 
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" 
                  placeholder="VD: Giảm đến 30% cho tất cả máy ảnh"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Hình ảnh *</label>
                <ImageUpload
                  value={formData.image}
                  onChange={(url) => setFormData({ ...formData, image: url })}
                  aspectRatio="aspect-video"
                />
                <p className="text-xs text-gray-400 mt-2">Hoặc dán link hình ảnh từ nơi khác</p>
                <input 
                  type="text" 
                  value={formData.image} 
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })} 
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all mt-2" 
                  placeholder="https://..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Link điều hướng</label>
                <input 
                  type="text" 
                  value={formData.link} 
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })} 
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" 
                  placeholder="/products"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Vị trí</label>
                  <select 
                    value={formData.position} 
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })} 
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  >
                    <option value="main">Banner chính</option>
                    <option value="promo">Khuyến mãi</option>
                    <option value="secondary">Phụ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Thứ tự</label>
                  <input 
                    type="number" 
                    value={formData.order} 
                    onChange={(e) => setFormData({ ...formData, order: e.target.value })} 
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" 
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nút bấm</label>
                <input 
                  type="text" 
                  value={formData.buttonText} 
                  onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })} 
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" 
                  placeholder="VD: Xem ngay"
                />
              </div>
              
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={formData.isActive} 
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} 
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Banner hoạt động</span>
              </label>
              
              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                  {editingBanner ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBanners;
