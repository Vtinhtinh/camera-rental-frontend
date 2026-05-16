import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const BannerSlider = ({ banners }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const bannersData = banners && banners.length > 0 ? banners : [
    {
      _id: '1',
      title: 'Thuê Máy Ảnh Chuyên Nghiệp',
      subtitle: 'Trải nghiệm những chiếc máy ảnh hàng đầu với giá cực kỳ hợp lý',
      image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1920&h=800&fit=crop',
      buttonText: 'Thuê ngay',
      link: '/products'
    },
    {
      _id: '2',
      title: 'Canon EOS R5 - Siêu Phẩm Mới',
      subtitle: 'Máy ảnh không gương lật cao cấp với cảm biến 45MP',
      image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1920&h=800&fit=crop',
      buttonText: 'Khám phá',
      link: '/products'
    },
    {
      _id: '3',
      title: 'Sony Alpha Series',
      subtitle: 'Lựa chọn hoàn hảo cho nhiếp ảnh gia chuyên nghiệp',
      image: 'https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?w=1920&h=800&fit=crop',
      buttonText: 'Xem thêm',
      link: '/products'
    }
  ];

  const goToSlide = useCallback((index) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex(index);
    setTimeout(() => setIsAnimating(false), 500);
  }, [isAnimating]);

  const goToPrev = useCallback(() => {
    const newIndex = currentIndex === 0 ? bannersData.length - 1 : currentIndex - 1;
    goToSlide(newIndex);
  }, [currentIndex, bannersData.length, goToSlide]);

  const goToNext = useCallback(() => {
    const newIndex = currentIndex === bannersData.length - 1 ? 0 : currentIndex + 1;
    goToSlide(newIndex);
  }, [currentIndex, bannersData.length, goToSlide]);

  useEffect(() => {
    if (bannersData.length <= 1) return;

    const interval = setInterval(() => {
      goToNext();
    }, 6000);

    return () => clearInterval(interval);
  }, [bannersData.length, goToNext]);

  return (
    <div className="relative w-full h-[400px] md:h-[450px] lg:h-[500px] rounded-2xl overflow-hidden group">
      {/* Slides */}
      <div className="relative w-full h-full">
        {bannersData.map((banner, index) => (
          <div
            key={banner._id || banner.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-out ${
              index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {/* Background Image */}
            <div className="absolute inset-0">
              <img
                src={banner.image.startsWith('http') ? banner.image : `${API_BASE}${banner.image}`}
                alt={banner.title}
                className="w-full h-full object-cover transform scale-105"
              />
              {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-slate-900/30" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>

            {/* Content */}
            <div className="relative h-full flex items-center">
              <div className="container mx-auto px-6 md:px-12">
                <div className="max-w-2xl">
                  <span className="inline-block px-4 py-1.5 bg-blue-600/80 backdrop-blur-sm text-white text-sm font-medium rounded-full mb-4 animate-fadeInUp">
                    {index === 0 ? '✨ Khuyến mãi' : index === 1 ? '🔥 Hot' : '⭐ Đề xuất'}
                  </span>
                  <h2 className={`text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight transition-all duration-700 ${
                    index === currentIndex ? 'animate-fadeInUp delay-100' : ''
                  }`}>
                    {banner.title}
                  </h2>
                  <p className={`text-lg md:text-xl text-white/90 mb-8 max-w-xl transition-all duration-700 delay-200 ${
                    index === currentIndex ? 'animate-fadeInUp' : 'opacity-0'
                  }`}>
                    {banner.subtitle}
                  </p>
                  <div className={`flex flex-wrap gap-4 transition-all duration-700 delay-300 ${
                    index === currentIndex ? 'animate-fadeInUp' : 'opacity-0'
                  }`}>
                    <Link
                      to={banner.link || '/products'}
                      className="px-8 py-3.5 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold rounded-full hover:shadow-btn hover:-translate-y-0.5 transition-all duration-300 active:scale-95"
                    >
                      {banner.buttonText || 'Khám phá ngay'}
                    </Link>
                    <Link
                      to="/contact"
                      className="px-8 py-3.5 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl border-2 border-white/30 hover:bg-white/20 transition-all duration-300"
                    >
                      Tư vấn ngay
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {bannersData.length > 1 && (
        <>
          <button
            onClick={goToPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 z-20 border border-white/20"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 z-20 border border-white/20"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {bannersData.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {bannersData.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'w-8 bg-white shadow-lg' 
                  : 'bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      )}

      {/* Progress Bar */}
      {bannersData.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-20">
          <div
            className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-100"
            style={{
              width: `${((currentIndex + 1) / bannersData.length) * 100}%`
            }}
          />
        </div>
      )}

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
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        .delay-100 {
          animation-delay: 0.1s;
        }
        .delay-200 {
          animation-delay: 0.2s;
        }
      `}</style>
    </div>
  );
};

export default BannerSlider;
