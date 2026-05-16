import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productApi, bannerApi } from '../api/endpoints';
import BannerSlider from '../components/BannerSlider';
import ProductCard from '../components/ProductCard';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [hotProducts, setHotProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, bannersRes] = await Promise.all([
          productApi.getFeatured(),
          bannerApi.getActive('main')
        ]);

        setFeaturedProducts(productsRes.data.featured || []);
        setHotProducts(productsRes.data.hot || []);
        setNewProducts(productsRes.data.newest || []);
        setBanners(bannersRes.data.banners || []);
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const features = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: 'Máy Ảnh Chất Lượng',
      description: 'Đa dạng dòng máy từ cơ bản đến chuyên nghiệp'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Giá Cả Hợp Lý',
      description: 'Nhiều gói thuê linh hoạt phù hợp với mọi nhu cầu'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: 'Giao Hàng Nhanh',
      description: 'Miễn phí giao hàng trong nội thành TP.HCM'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: 'Bảo Hiểm Thiết Bị',
      description: 'Mọi thiết bị đều được bảo hiểm khi thuê'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-8 pb-16">
        <BannerSlider banners={banners} />
      </section>

      {/* Features Section */}
      <section className="bg-gradient-to-b from-white to-slate-50 py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-white p-8 rounded-2xl border border-slate-100 shadow-soft hover:shadow-hover transition-all duration-500 text-center hover:-translate-y-1"
              >
                <div className="w-20 h-20 mx-auto mb-5 bg-indigo-50 rounded-2xl flex items-center justify-center text-primary-600 group-hover:bg-primary-100 group-hover:scale-110 transition-all duration-300">
                  {feature.icon}
                </div>
                <h3 className="font-bold text-slate-900 mb-2 text-base">{feature.title}</h3>
                <p className="text-slate-500 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4 py-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="inline-block px-4 py-1.5 bg-indigo-100 text-primary-600 text-sm font-semibold rounded-full mb-3">
              ✨ Nổi bật
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2">
              <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">Máy Ảnh</span> Nổi Bật
            </h2>
            <p className="text-slate-500 mt-2">Những dòng máy được yêu thích nhất</p>
          </div>
          <Link
            to="/products?filter=featured"
            className="group inline-flex items-center gap-2 text-primary-600 hover:text-secondary-600 font-semibold transition-colors"
          >
            Xem tất cả
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="bg-slate-100 h-[450px] rounded-2xl animate-pulse" />
            ))
          ) : featuredProducts.length > 0 ? (
            featuredProducts.slice(0, 4).map((product, index) => (
              <div
                key={product.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <ProductCard product={product} />
              </div>
            ))
          ) : (
            <div className="col-span-4 text-center py-12 text-slate-400">
              Chưa có sản phẩm nổi bật nào
            </div>
          )}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="relative overflow-hidden">
        {/* Background Gradient with Blobs */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-96 h-96 bg-secondary-600 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-600 rounded-full blur-3xl" />
          </div>
        </div>
        
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="container mx-auto px-4 py-20 md:py-28 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6">
              Bạn Cần <span className="bg-gradient-to-r from-indigo-300 to-violet-300 bg-clip-text text-transparent">Tư Vấn?</span>
            </h2>
            <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto">
              Liên hệ ngay với chúng tôi để được hỗ trợ tốt nhất về lựa chọn máy ảnh phù hợp với nhu cầu của bạn
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contact"
                className="px-10 py-4 bg-white text-primary-700 font-bold rounded-full hover:shadow-btn transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
              >
                Liên hệ ngay
              </Link>
              <Link
                to="/products"
                className="px-10 py-4 bg-transparent text-white font-bold rounded-full border-2 border-white/30 hover:border-white/60 hover:bg-white/10 transition-all duration-300"
              >
                Xem sản phẩm
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Hot Products */}
      <section className="container mx-auto px-4 py-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="inline-block px-4 py-1.5 bg-red-100 text-red-600 text-sm font-semibold rounded-full mb-3">
              🔥 Hot nhất
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2">
              Máy Ảnh Được <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">Thuê Nhiều</span>
            </h2>
            <p className="text-slate-500 mt-2">Top những máy ảnh được khách hàng lựa chọn nhiều nhất</p>
          </div>
          <Link
            to="/products?filter=hot"
            className="group inline-flex items-center gap-2 text-primary-600 hover:text-secondary-600 font-semibold transition-colors"
          >
            Xem tất cả
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="bg-slate-100 h-[450px] rounded-2xl animate-pulse" />
            ))
          ) : hotProducts.length > 0 ? (
            hotProducts.slice(0, 4).map((product, index) => (
              <div
                key={product.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <ProductCard product={product} />
              </div>
            ))
          ) : (
            <div className="col-span-4 text-center py-12 text-slate-400">
              Chưa có sản phẩm hot nào
            </div>
          )}
        </div>
      </section>

      {/* New Products */}
      <section className="bg-gradient-to-b from-slate-50 to-white py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="inline-block px-4 py-1.5 bg-emerald-100 text-emerald-600 text-sm font-semibold rounded-full mb-3">
                🆕 Mới nhất
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2">
                Máy Ảnh <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">Mới Cập Nhật</span>
              </h2>
              <p className="text-slate-500 mt-2">Cập nhật những dòng máy mới nhất</p>
            </div>
            <Link
              to="/products?filter=new"
              className="group inline-flex items-center gap-2 text-primary-600 hover:text-secondary-600 font-semibold transition-colors"
            >
              Xem tất cả
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="bg-slate-100 h-[450px] rounded-2xl animate-pulse" />
              ))
            ) : newProducts.length > 0 ? (
              newProducts.slice(0, 4).map((product, index) => (
                <div
                  key={product.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <ProductCard product={product} />
                </div>
              ))
            ) : (
              <div className="col-span-4 text-center py-12 text-slate-400">
                Chưa có sản phẩm mới nào
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-r from-primary-600 to-secondary-600 py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-white rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: '500+', label: 'Máy ảnh' },
              { number: '2000+', label: 'Khách hàng' },
              { number: '98%', label: 'Hài lòng' },
              { number: '24/7', label: 'Hỗ trợ' }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-3">
                  {stat.number}
                </div>
                <p className="text-indigo-100 font-semibold">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 bg-violet-100 text-secondary-600 text-sm font-semibold rounded-full mb-4">
            📋 Quy trình
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
            Thuê Máy Ảnh <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">Đơn Giản</span>
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto">Chỉ với 4 bước đơn giản, bạn đã có thể sở hữu chiếc máy ảnh mà mình mong muốn</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              step: '01',
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              ),
              title: 'Chọn máy ảnh',
              description: 'Tìm và chọn máy ảnh phù hợp với nhu cầu của bạn'
            },
            {
              step: '02',
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              ),
              title: 'Đặt lịch thuê',
              description: 'Chọn ngày thuê và thời gian phù hợp với bạn'
            },
            {
              step: '03',
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
              title: 'Xác nhận đơn',
              description: 'Nhận xác nhận qua điện thoại hoặc email'
            },
            {
              step: '04',
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              ),
              title: 'Nhận máy',
              description: 'Nhận máy tại cửa hàng hoặc giao tận nơi'
            }
          ].map((item, index) => (
            <div key={index} className="relative group">
              <div className="bg-white p-10 rounded-2xl border border-slate-100 shadow-soft hover:shadow-hover transition-all duration-500 text-center hover:-translate-y-1">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-2xl flex items-center justify-center text-primary-600 transform group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </div>
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-btn group-hover:shadow-glow transition-shadow">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-500 text-sm">{item.description}</p>
              </div>
              {index < 3 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 text-primary-300">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default Home;
