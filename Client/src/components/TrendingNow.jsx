import React, { memo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { productAPI } from '../services/api';

const TrendingNow = memo(() => {
  const { isDarkMode, colors } = useTheme();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 최근 등록된 상품 3개 가져오기
  useEffect(() => {
    const fetchRecentProducts = async () => {
      try {
        setLoading(true);
        const response = await productAPI.getAllProducts({
          limit: 3,
          isActive: true,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        });
        
        if (response.data.success) {
          setProducts(response.data.data.products || []);
        }
      } catch (error) {
        console.error('최근 상품 로딩 오류:', error);
        // 오류 시 빈 배열 유지
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentProducts();
  }, []);

  const sectionStyle = {
    backgroundColor: colors.surface,
    padding: '4rem 0',
    borderTop: `1px solid ${colors.border}`,
    transition: 'background-color 0.3s ease'
  };

  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1rem'
  };

  const titleStyle = {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: '1rem',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    transition: 'color 0.3s ease'
  };

  const subtitleStyle = {
    fontSize: '1.1rem',
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: '3rem',
    fontWeight: '400',
    transition: 'color 0.3s ease'
  };

  const productGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '2.5rem'
  };

  const productItemStyle = {
    backgroundColor: colors.card,
    borderRadius: '12px',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    border: `2px solid ${colors.border}`,
    boxShadow: isDarkMode 
      ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
      : '0 8px 32px rgba(0, 0, 0, 0.1)'
  };

  const productImageStyle = {
    width: '100%',
    height: '280px',
    objectFit: 'cover',
    display: 'block'
  };

  const placeholderImageStyle = {
    width: '100%',
    height: '280px',
    backgroundColor: isDarkMode ? '#2a2a2a' : '#f0f0f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: colors.text.secondary,
    fontSize: '1rem',
    fontWeight: '500'
  };

  const productInfoStyle = {
    padding: '1.5rem'
  };

  const productNameStyle = {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: '0.8rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    transition: 'color 0.3s ease',
    lineHeight: '1.4'
  };

  const productPriceStyle = {
    fontSize: '1.2rem',
    fontWeight: '700',
    color: colors.text.primary,
    transition: 'color 0.3s ease'
  };

  const saleBadgeStyle = {
    position: 'absolute',
    top: '12px',
    left: '12px',
    backgroundColor: '#ff4444',
    color: 'white',
    padding: '0.4rem 0.8rem',
    fontSize: '0.8rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderRadius: '6px',
    zIndex: 2
  };

  const newBadgeStyle = {
    position: 'absolute',
    top: '12px',
    right: '12px',
    backgroundColor: '#28a745',
    color: 'white',
    padding: '0.4rem 0.8rem',
    fontSize: '0.8rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderRadius: '6px',
    zIndex: 2
  };

  const handleProductHover = (e, isHover) => {
    const card = e.currentTarget;
    if (isHover) {
      card.style.transform = 'translateY(-8px) scale(1.02)';
      card.style.boxShadow = isDarkMode 
        ? '0 20px 40px rgba(0, 0, 0, 0.5)' 
        : '0 20px 40px rgba(0, 0, 0, 0.15)';
    } else {
      card.style.transform = 'translateY(0) scale(1)';
      card.style.boxShadow = isDarkMode 
        ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
        : '0 8px 32px rgba(0, 0, 0, 0.1)';
    }
  };

  // 상품 클릭 핸들러
  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
  };

  // 상품이 최근 등록된 것인지 확인 (7일 이내)
  const isNewProduct = (createdAt) => {
    const productDate = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now - productDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  if (loading) {
    return (
      <section style={sectionStyle}>
        <div style={containerStyle}>
          <h2 style={titleStyle}>TRENDING NOW</h2>
          <p style={subtitleStyle}>Loading latest products...</p>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '200px'
          }}>
            <div style={{
              fontSize: '1rem',
              color: colors.text.secondary
            }}>
              상품을 불러오는 중...
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section style={sectionStyle}>
      <div style={containerStyle}>
        <h2 style={titleStyle}>TRENDING NOW</h2>
        <p style={subtitleStyle}>Discover our latest and most popular products</p>
        
        {products.length > 0 ? (
          <div style={productGridStyle}>
            {products.map((product) => (
              <div
                key={product._id}
                style={{...productItemStyle, position: 'relative'}}
                onMouseEnter={(e) => handleProductHover(e, true)}
                onMouseLeave={(e) => handleProductHover(e, false)}
                onClick={() => handleProductClick(product._id)}
              >
                {product.salePrice && product.salePrice < product.price && (
                  <div style={saleBadgeStyle}>SALE</div>
                )}
                {isNewProduct(product.createdAt) && (
                  <div style={newBadgeStyle}>NEW</div>
                )}
                
                {product.image?.url ? (
                  <img 
                    src={product.image.url} 
                    alt={product.image.alt || product.name}
                    style={productImageStyle}
                  />
                ) : (
                  <div style={placeholderImageStyle}>
                    No Image Available
                  </div>
                )}
                
                <div style={productInfoStyle}>
                  <h3 style={productNameStyle}>{product.name}</h3>
                  <div style={productPriceStyle}>
                    {product.salePrice && product.salePrice < product.price ? (
                      <>
                        ₩{product.salePrice?.toLocaleString()}
                        <span style={{
                          textDecoration: 'line-through',
                          color: colors.text.secondary,
                          marginLeft: '0.5rem',
                          fontSize: '1rem',
                          fontWeight: '400'
                        }}>
                          ₩{product.price?.toLocaleString()}
                        </span>
                      </>
                    ) : (
                      `₩${product.price?.toLocaleString()}`
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '3rem 0',
            color: colors.text.secondary
          }}>
            <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
              아직 등록된 상품이 없습니다.
            </p>
            <p style={{ fontSize: '0.9rem' }}>
              관리자 페이지에서 상품을 추가해보세요.
            </p>
          </div>
        )}
      </div>
    </section>
  );
});

TrendingNow.displayName = 'TrendingNow';

export default TrendingNow;