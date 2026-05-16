import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productApi } from '../api/endpoints';
import ProductCard from '../components/ProductCard';

const Pricing = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBrand, setSelectedBrand] = useState('all');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await productApi.getAll({ limit: 100 });
        setProducts(res.data.products || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const brands = ['all', ...new Set(products.map(p => p.brand))];
  const filteredProducts = selectedBrand === 'all' ? products : products.filter(p => p.brand === selectedBrand);

  const samplePricing = [
    { duration: '6 tiếng', description: 'Phù hợp cho sự kiện ngắn, chụp hình cưới', discount: 0 },
    { duration: '12 tiếng', description: 'Phù hợp cho một buổi chụp hoàn chỉnh', discount: 0 },
    { duration: '1 ngày', description: 'Gói phổ biến nhất', discount: 0 },
    { duration: '2 ngày', description: 'Tiết kiệm hơn cho thuê dài hạn', discount: 10 },
    { duration: '3+ ngày', description: 'Ưu đãi lớn cho khách thuê thường xuyên', discount: 20 }
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-950 border-b border-gray-800">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold text-white mb-3">Bảng giá thuê máy ảnh</h1>
          <p className="text-gray-400 text-lg">Giá cả hợp lý - Chất lượng đảm bảo</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Pricing by Duration */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Bảng giá theo thời gian</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {samplePricing.map((item, i) => (
              <div key={i} className="bg-gray-800 rounded-2xl p-6 border border-gray-700 text-center hover:border-blue-500/50 transition-colors">
                <div className="text-3xl font-bold text-blue-400 mb-2">{item.duration}</div>
                <p className="text-gray-400 text-sm mb-2">{item.description}</p>
                {item.discount > 0 && (
                  <span className="bg-green-500/20 text-green-400 text-sm px-2 py-1 rounded border border-green-500/30">
                    Tiết kiệm {item.discount}%
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Special Offers */}
        <section className="mb-12">
          <div className="bg-gradient-to-r from-blue-600/20 to-blue-800/20 rounded-2xl p-8 border border-blue-500/30">
            <h2 className="text-2xl font-bold text-white mb-4 text-center">Ưu đãi đặc biệt</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="text-center p-6 bg-gray-800/50 rounded-xl border border-gray-700">
                <div className="text-4xl mb-3">🎉</div>
                <h3 className="font-bold text-white mb-1">Thuê 5 ngày giá 4</h3>
                <p className="text-sm text-gray-400">Áp dụng cho khách VIP</p>
              </div>
              <div className="text-center p-6 bg-gray-800/50 rounded-xl border border-gray-700">
                <div className="text-4xl mb-3">📅</div>
                <h3 className="font-bold text-white mb-1">Đặt sớm giảm 10%</h3>
                <p className="text-sm text-gray-400">Book trước 7 ngày</p>
              </div>
              <div className="text-center p-6 bg-gray-800/50 rounded-xl border border-gray-700">
                <div className="text-4xl mb-3">🤝</div>
                <h3 className="font-bold text-white mb-1">Khách quen giảm 15%</h3>
                <p className="text-sm text-gray-400">Từ đơn thứ 3 trở đi</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Table */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Giá thuê theo sản phẩm</h2>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              {brands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand === 'all' ? 'Tất cả hãng' : brand}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-800 h-48 rounded-xl animate-pulse border border-gray-700" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Sản phẩm</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">6 tiếng</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">12 tiếng</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">1 ngày</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">2 ngày</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">3+ ngày</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="border-t border-gray-700 hover:bg-gray-750 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.mainImage || 'https://via.placeholder.com/50'}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-lg border border-gray-600"
                          />
                          <div>
                            <p className="font-medium text-white">{product.name}</p>
                            <p className="text-sm text-gray-400">{product.brand}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-gray-300">{product.pricing?.price6h?.toLocaleString()}đ</td>
                      <td className="px-6 py-4 text-center text-gray-300">{product.pricing?.price12h?.toLocaleString()}đ</td>
                      <td className="px-6 py-4 text-center font-semibold text-blue-400">
                        {product.pricing?.price1d?.toLocaleString()}đ
                      </td>
                      <td className="px-6 py-4 text-center text-gray-300">{product.pricing?.price2d?.toLocaleString()}đ</td>
                      <td className="px-6 py-4 text-center text-green-400 font-semibold">
                        {product.pricing?.price3dPlus?.toLocaleString()}đ
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Link
                          to={`/products/${product.id}`}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-block font-medium"
                        >
                          Chi tiết
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* FAQ Section */}
        <section className="mt-12 bg-gray-800 rounded-2xl p-8 border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Câu hỏi thường gặp</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { q: 'Giá thuê đã bao gồm những gì?', a: 'Giá đã bao gồm máy, pin, thẻ nhớ, túi đựng và phụ kiện cơ bản.' },
              { q: 'Có cần đặt cọc không?', a: 'Có, quý khách cần đặt cọc CMND/CCCD và một khoản tiền tùy theo giá trị máy.' },
              { q: 'Có giao hàng tận nơi không?', a: 'Có, chúng tôi giao miễn phí trong nội thành TP.HCM.' },
              { q: 'Có hỗ trợ kỹ thuật không?', a: 'Có, đội ngũ kỹ thuật hỗ trợ 24/7 trong suốt thời gian thuê.' }
            ].map((faq, i) => (
              <div key={i} className="bg-gray-900 rounded-xl p-5 border border-gray-700">
                <h3 className="font-semibold text-white mb-2">{faq.q}</h3>
                <p className="text-gray-400 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Pricing;
