import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';

const ProductCard = memo(({ product }) => {
  const navigate = useNavigate();
  
  const formatPrice = (price) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const handleCardClick = () => {
    navigate(`/products/${product._id}`);
  };

  const cardStyle = {
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
  };

  const imageContainerStyle = {
    width: '100%',
    height: '280px',
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#f8f9fa',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const imageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'contain', // cover에서 contain으로 변경하여 전체 이미지가 보이도록
    transition: 'transform 0.3s ease',
    padding: '8px' // 이미지 주변에 약간의 여백 추가
  };

  const contentStyle = {
    padding: '16px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  };

  const titleStyle = {
    fontSize: '16px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '8px',
    lineHeight: '1.4',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical'
  };

  const categoryStyle = {
    fontSize: '12px',
    color: '#666',
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };

  const priceContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: 'auto'
  };

  const priceStyle = {
    fontSize: '18px',
    fontWeight: '700',
    color: '#2c5aa0'
  };

  const originalPriceStyle = {
    fontSize: '14px',
    color: '#999',
    textDecoration: 'line-through'
  };

  const discountStyle = {
    fontSize: '12px',
    color: '#e74c3c',
    fontWeight: '600',
    backgroundColor: '#ffe6e6',
    padding: '2px 6px',
    borderRadius: '4px'
  };

  const stockStyle = {
    fontSize: '12px',
    color: product.stock > 0 ? '#27ae60' : '#e74c3c',
    fontWeight: '500',
    marginTop: '4px'
  };

  const handleCardHover = (e) => {
    e.currentTarget.style.transform = 'translateY(-4px)';
    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
    const img = e.currentTarget.querySelector('img');
    if (img) {
      img.style.transform = 'scale(1.05)';
    }
  };

  const handleCardLeave = (e) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
    const img = e.currentTarget.querySelector('img');
    if (img) {
      img.style.transform = 'scale(1)';
    }
  };

  const discountPercentage = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div 
      style={cardStyle}
      onMouseEnter={handleCardHover}
      onMouseLeave={handleCardLeave}
      onClick={handleCardClick}
    >
      <div style={imageContainerStyle}>
        <img 
          src={product.image?.url || '/placeholder-image.jpg'} 
          alt={product.image?.alt || product.name}
          style={imageStyle}
          onError={(e) => {
            e.target.src = '/placeholder-image.jpg';
          }}
        />
        {discountPercentage > 0 && (
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            ...discountStyle
          }}>
            -{discountPercentage}%
          </div>
        )}
      </div>
      
      <div style={contentStyle}>
        <div>
          <div style={categoryStyle}>{product.category}</div>
          <h3 style={titleStyle}>{product.name}</h3>
        </div>
        
        <div>
          <div style={priceContainerStyle}>
            <span style={priceStyle}>₩{formatPrice(product.price)}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span style={originalPriceStyle}>₩{formatPrice(product.originalPrice)}</span>
            )}
          </div>
          <div style={stockStyle}>
            {product.stock > 0 ? `재고 ${product.stock}개` : '품절'}
          </div>
        </div>
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;