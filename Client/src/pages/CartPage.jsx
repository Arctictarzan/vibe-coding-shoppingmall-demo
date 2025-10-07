import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const CartPage = () => {
  const navigate = useNavigate();
  const { user, logout, isLoading } = useAuth();
  const { 
    cartItems, 
    cartItemCount, 
    loading, 
    error, 
    fetchCart, 
    updateCartItem, 
    removeFromCart, 
    clearCart, 
    getTotalAmount 
  } = useCart();
  
  const [updating, setUpdating] = useState({});
  const [imageErrors, setImageErrors] = useState({});

  const isAdminUser = useMemo(() => {
    return user?.user_type === 'admin';
  }, [user]);

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  // 이미지 로드 에러 처리
  const handleImageError = useCallback((itemId) => {
    setImageErrors(prev => ({ ...prev, [itemId]: true }));
  }, []);

  // 이미지 로드 성공 처리
  const handleImageLoad = useCallback((itemId) => {
    setImageErrors(prev => ({ ...prev, [itemId]: false }));
  }, []);

  // 이미지 URL 가져오기 (안전한 접근)
  const getImageUrl = useCallback((item) => {
    // 여러 가능한 이미지 경로 확인
    if (item.product?.image?.url) {
      return item.product.image.url;
    }
    if (item.product?.images?.[0]) {
      return item.product.images[0];
    }
    if (item.product?.imageUrl) {
      return item.product.imageUrl;
    }
    return null;
  }, []);

  // 대체 이미지 URL
  const getPlaceholderImage = () => {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEwMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0zNSA0NUw0NSA1NUw1NSA0NUw2NSA1NUw3NSA0NUw2NSAzNUw1NSAyNUw0NSAzNUwzNSA0NVoiIGZpbGw9IiNEREREREQiLz4KPHN2ZyB4PSIyNSIgeT0iNzAiIHdpZHRoPSI1MCIgaGVpZ2h0PSIyMCI+Cjx0ZXh0IHg9IjI1IiB5PSIxNSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOTk5OTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7snbTrr7jsp4A8L3RleHQ+Cjwvc3ZnPgo=';
  };

  // 수량 업데이트
  const handleQuantityUpdate = async (itemId, newQuantity) => {
    if (newQuantity < 1 || newQuantity > 99) {
      return;
    }

    setUpdating(prev => ({ ...prev, [itemId]: true }));
    
    try {
      await updateCartItem(itemId, newQuantity);
    } catch (error) {
      console.error('수량 업데이트 오류:', error);
    } finally {
      setUpdating(prev => ({ ...prev, [itemId]: false }));
    }
  };

  // 아이템 삭제
  const handleRemoveItem = async (itemId) => {
    try {
      setUpdating(prev => ({ ...prev, [itemId]: true }));
      const result = await removeFromCart(itemId);
      
      if (!result.success) {
        alert(result.message || '아이템 삭제 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('아이템 삭제 오류:', error);
      alert('아이템 삭제 중 오류가 발생했습니다.');
    } finally {
      setUpdating(prev => ({ ...prev, [itemId]: false }));
    }
  };

  // 장바구니 비우기
  const handleClearCart = async () => {
    if (!window.confirm('장바구니를 모두 비우시겠습니까?')) return;
    
    const result = await clearCart();
    
    if (!result.success) {
      alert(result.message || '장바구니 비우기 중 오류가 발생했습니다.');
    }
  };

  // 상품 상세 페이지로 이동
  const handleProductClick = useCallback((productId) => {
    if (productId) {
      navigate(`/products/${productId}`);
    }
  }, [navigate]);

  // 총 금액 계산 (CartContext에서 가져오기)
  const totalAmount = useMemo(() => {
    try {
      return getTotalAmount ? getTotalAmount() : 0;
    } catch (error) {
      console.error('총 금액 계산 오류:', error);
      return 0;
    }
  }, [getTotalAmount]);

  // 총 아이템 수 계산 (CartContext에서 가져오기)
  const totalItems = useMemo(() => {
    return cartItemCount || 0;
  }, [cartItemCount]);

  useEffect(() => {
    const initializeCart = async () => {
      try {
        if (user) {
          await fetchCart();
        } else {
          navigate('/login');
        }
      } catch (error) {
        console.error('장바구니 초기화 오류:', error);
      }
    };
    
    initializeCart();
  }, [user, fetchCart, navigate]);

  // 스타일 정의
  const pageStyle = {
    minHeight: '100vh',
    backgroundColor: 'var(--bg-color, #ffffff)',
    fontFamily: "'Noto Sans KR', sans-serif"
  };

  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    paddingTop: '100px'
  };

  const headerStyle = {
    textAlign: 'center',
    marginBottom: '40px'
  };

  const titleStyle = {
    fontSize: '28px',
    fontWeight: '700',
    color: 'var(--text-color, #000000)',
    marginBottom: '10px',
    letterSpacing: '-0.5px'
  };

  const subtitleStyle = {
    fontSize: '14px',
    color: 'var(--text-secondary, #666666)',
    fontWeight: '400'
  };

  const cartContentStyle = {
    display: 'flex',
    gap: '40px',
    alignItems: 'flex-start'
  };

  const cartItemsStyle = {
    flex: '2',
    backgroundColor: 'var(--bg-color, #ffffff)'
  };

  const cartSummaryStyle = {
    flex: '1',
    backgroundColor: 'var(--card-bg, #f8f9fa)',
    padding: '30px',
    borderRadius: '8px',
    position: 'sticky',
    top: '120px'
  };

  const itemStyle = {
    display: 'flex',
    padding: '20px 0',
    borderBottom: '1px solid var(--border-color, #e9ecef)',
    alignItems: 'center',
    gap: '20px'
  };

  const itemImageStyle = {
    width: '100px',
    height: '120px',
    objectFit: 'cover',
    borderRadius: '4px'
  };

  const itemInfoStyle = {
    flex: '1'
  };

  const itemNameStyle = {
    fontSize: '16px',
    fontWeight: '600',
    color: 'var(--text-color, #000000)',
    marginBottom: '8px',
    lineHeight: '1.4'
  };

  const itemDetailsStyle = {
    fontSize: '14px',
    color: 'var(--text-secondary, #666666)',
    marginBottom: '12px'
  };

  const itemPriceStyle = {
    fontSize: '16px',
    fontWeight: '700',
    color: 'var(--text-color, #000000)'
  };

  const quantityControlStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginTop: '12px'
  };

  const quantityButtonStyle = {
    width: '32px',
    height: '32px',
    border: '1px solid var(--border-color, #ddd)',
    backgroundColor: 'var(--card-bg, #ffffff)',
    color: 'var(--text-color, #000000)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    borderRadius: '4px'
  };

  const quantityInputStyle = {
    width: '60px',
    height: '32px',
    textAlign: 'center',
    border: '1px solid var(--border-color, #ddd)',
    backgroundColor: 'var(--card-bg, #ffffff)',
    color: 'var(--text-color, #000000)',
    borderRadius: '4px',
    fontSize: '14px'
  };

  const removeButtonStyle = {
    background: 'none',
    border: 'none',
    color: '#dc3545',
    cursor: 'pointer',
    fontSize: '14px',
    textDecoration: 'underline',
    marginTop: '8px'
  };

  const summaryTitleStyle = {
    fontSize: '18px',
    fontWeight: '700',
    color: 'var(--text-color, #000000)',
    marginBottom: '20px'
  };

  const summaryRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '12px',
    fontSize: '14px',
    color: 'var(--text-color, #000000)'
  };

  const totalRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '20px',
    paddingTop: '20px',
    borderTop: '2px solid var(--text-color, #000000)',
    fontSize: '18px',
    fontWeight: '700',
    color: 'var(--text-color, #000000)'
  };

  const checkoutButtonStyle = {
    width: '100%',
    padding: '16px',
    backgroundColor: '#000000',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '20px',
    transition: 'background-color 0.2s'
  };

  const emptyCartStyle = {
    textAlign: 'center',
    padding: '80px 20px',
    color: 'var(--text-secondary, #666666)'
  };

  const emptyCartIconStyle = {
    fontSize: '48px',
    marginBottom: '20px',
    opacity: '0.5'
  };

  const continueShoppingButtonStyle = {
    padding: '12px 24px',
    backgroundColor: 'var(--bg-color, #ffffff)',
    color: 'var(--text-color, #000000)',
    border: '2px solid var(--text-color, #000000)',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '20px',
    transition: 'all 0.2s'
  };

  const clearCartButtonStyle = {
    background: 'none',
    border: 'none',
    color: '#dc3545',
    cursor: 'pointer',
    fontSize: '14px',
    textDecoration: 'underline',
    marginBottom: '20px'
  };

  if (loading) {
    return (
      <div style={pageStyle}>
        <Navbar 
          user={user} 
          onLogout={handleLogout} 
          isAdmin={isAdminUser}
          cartItemCount={totalItems}
        />
        <div style={containerStyle}>
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <div style={{ fontSize: '18px', color: 'var(--text-secondary, #666666)' }}>로딩 중...</div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div style={pageStyle}>
        <Navbar 
          user={user} 
          onLogout={handleLogout} 
          isAdmin={isAdminUser}
          cartItemCount={totalItems}
        />
        <div style={containerStyle}>
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <div style={{ fontSize: '18px', color: '#dc3545', marginBottom: '20px' }}>{error}</div>
            <button 
              onClick={() => window.location.reload()}
              style={continueShoppingButtonStyle}
            >
              다시 시도
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <Navbar 
        user={user} 
        onLogout={handleLogout} 
        isAdmin={isAdminUser}
        cartItemCount={totalItems}
      />
      
      <div style={containerStyle}>
        <div style={headerStyle}>
          <h1 style={titleStyle}>장바구니</h1>
          <p style={subtitleStyle}>선택하신 상품들을 확인해보세요</p>
        </div>

        {(!cartItems || cartItems.length === 0) ? (
          <div style={emptyCartStyle}>
            <div style={emptyCartIconStyle}>🛒</div>
            <h3 style={{ marginBottom: '10px', color: 'var(--text-color, #000000)' }}>장바구니가 비어있습니다</h3>
            <p style={{ marginBottom: '30px' }}>원하는 상품을 장바구니에 담아보세요</p>
            <button 
              onClick={() => navigate('/')}
              style={continueShoppingButtonStyle}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#000000';
                e.target.style.color = '#ffffff';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#ffffff';
                e.target.style.color = '#000000';
              }}
            >
              쇼핑 계속하기
            </button>
          </div>
        ) : (
          <div style={cartContentStyle}>
            <div style={cartItemsStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600' }}>상품 목록 ({cartItems.length}개)</h3>
                {cartItems.length > 0 && (
                  <button onClick={handleClearCart} style={clearCartButtonStyle}>
                    전체 삭제
                  </button>
                )}
              </div>
              
              {(cartItems || []).map((item) => (
                <div key={item._id} style={itemStyle}>
                  <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => handleProductClick(item.product?._id)}>
                    <img 
                      src={imageErrors[item._id] ? getPlaceholderImage() : (getImageUrl(item) || getPlaceholderImage())}
                      alt={item.product?.name || '상품 이미지'}
                      style={{...itemImageStyle, cursor: 'pointer'}}
                      onError={() => handleImageError(item._id)}
                      onLoad={() => handleImageLoad(item._id)}
                    />
                    {imageErrors[item._id] && (
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        fontSize: '10px',
                        color: '#999',
                        textAlign: 'center',
                        pointerEvents: 'none'
                      }}>
                        이미지 없음
                      </div>
                    )}
                  </div>
                  
                  <div style={itemInfoStyle}>
                    <h4 
                      style={{...itemNameStyle, cursor: 'pointer'}} 
                      onClick={() => handleProductClick(item.product?._id)}
                    >
                      {item.product?.name || '상품명 없음'}
                    </h4>
                    <div style={itemDetailsStyle}>
                      {item.color && <span>색상: {item.color} </span>}
                      {item.size && <span>사이즈: {item.size}</span>}
                    </div>
                    <div style={itemPriceStyle}>
                      ₩{(item.product?.salePrice || item.product?.price || 0).toLocaleString()}
                    </div>
                    
                    <div style={quantityControlStyle}>
                      <button 
                        style={quantityButtonStyle}
                        onClick={() => handleQuantityUpdate(item._id, item.quantity - 1)}
                        disabled={updating[item._id] || item.quantity <= 1}
                      >
                        -
                      </button>
                      <input 
                        type="number"
                        value={item.quantity}
                        onChange={(e) => {
                          const newQuantity = parseInt(e.target.value) || 1;
                          if (newQuantity > 0) {
                            handleQuantityUpdate(item._id, newQuantity);
                          }
                        }}
                        style={quantityInputStyle}
                        min="1"
                        disabled={updating[item._id]}
                      />
                      <button 
                        style={quantityButtonStyle}
                        onClick={() => handleQuantityUpdate(item._id, item.quantity + 1)}
                        disabled={updating[item._id]}
                      >
                        +
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => handleRemoveItem(item._id)}
                      style={removeButtonStyle}
                      disabled={updating[item._id]}
                    >
                      {updating[item._id] ? '처리 중...' : '삭제'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div style={cartSummaryStyle}>
              <h3 style={summaryTitleStyle}>주문 요약</h3>
              
              <div style={summaryRowStyle}>
                <span>상품 수량</span>
                <span>{totalItems}개</span>
              </div>
              
              <div style={summaryRowStyle}>
                <span>상품 금액</span>
                <span>₩{totalAmount.toLocaleString()}</span>
              </div>
              
              <div style={summaryRowStyle}>
                <span>배송비</span>
                <span>{totalAmount >= 50000 ? '무료' : '₩3,000'}</span>
              </div>
              
              <div style={totalRowStyle}>
                <span>총 결제 금액</span>
                <span>₩{(totalAmount + (totalAmount >= 50000 ? 0 : 3000)).toLocaleString()}</span>
              </div>
              
              <button 
                style={checkoutButtonStyle}
                onMouseOver={(e) => e.target.style.backgroundColor = '#333333'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#000000'}
                onClick={() => navigate('/checkout')}
              >
                결제하기
              </button>
              
              <button 
                onClick={() => navigate('/')}
                style={{
                  ...continueShoppingButtonStyle,
                  width: '100%',
                  marginTop: '12px'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#000000';
                  e.target.style.color = '#ffffff';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = '#ffffff';
                  e.target.style.color = '#000000';
                }}
              >
                쇼핑 계속하기
              </button>
            </div>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default CartPage;