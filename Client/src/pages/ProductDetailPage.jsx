import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productAPI } from '../services/api';
import StarRating from '../components/StarRating';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout, isLoading } = useAuth();
  const { addToCart, cartItemCount, loading: cartLoading } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [relatedProducts, setRelatedProducts] = useState([]);

  const isAdminUser = useMemo(() => {
    return user?.role === 'admin';
  }, [user]);

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  // 상품 정보 가져오기
  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      const response = await productAPI.getProductById(id);
      
      if (response.data.success) {
        setProduct(response.data.data);
        // 기본 색상과 사이즈 설정
        if (response.data.data.specifications?.colors?.length > 0) {
          setSelectedColor(response.data.data.specifications.colors[0]);
        }
        if (response.data.data.specifications?.sizes?.length > 0) {
          setSelectedSize(response.data.data.specifications.sizes[0]);
        }
      } else {
        setError('상품을 찾을 수 없습니다.');
      }
    } catch (error) {
      console.error('상품 조회 오류:', error);
      setError('상품 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  // 관련 상품 가져오기
  const fetchRelatedProducts = useCallback(async (category) => {
    try {
      const response = await productAPI.getAllProducts({
        category: category,
        limit: 4,
        isActive: true
      });
      
      if (response.data.success) {
        // 현재 상품 제외
        const filtered = response.data.data.products.filter(p => p._id !== id);
        setRelatedProducts(filtered.slice(0, 3));
      }
    } catch (error) {
      console.error('관련 상품 조회 오류:', error);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  useEffect(() => {
    if (product?.category) {
      fetchRelatedProducts(product.category);
    }
  }, [product?.category, fetchRelatedProducts]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const handleQuantityIncrease = () => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const handleQuantityDecrease = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = async () => {
    // 로그인 확인
    if (!user) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    // 필수 옵션 확인
    if (product.specifications?.colors?.length > 0 && !selectedColor) {
      alert('색상을 선택해주세요.');
      return;
    }

    if (product.specifications?.sizes?.length > 0 && !selectedSize) {
      alert('사이즈를 선택해주세요.');
      return;
    }

    // 재고 확인
    if (quantity > product.stock) {
      alert('재고가 부족합니다.');
      return;
    }

    try {
      const options = {
        quantity,
        ...(selectedColor && { color: selectedColor }),
        ...(selectedSize && { size: selectedSize })
      };

      const result = await addToCart(product._id, options);
      
      if (result.success) {
        alert(`${product.name} ${quantity}개가 장바구니에 담겼습니다!`);
      } else {
        alert(result.message || '장바구니 추가에 실패했습니다.');
      }
    } catch (error) {
      console.error('장바구니 추가 오류:', error);
      alert('장바구니 추가 중 오류가 발생했습니다.');
    }
  };

  const discountPercentage = product?.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{
          fontSize: '1rem',
          color: '#666',
          fontWeight: '300'
        }}>
          Loading...
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{
          fontSize: '1.2rem',
          color: '#e74c3c',
          marginBottom: '20px'
        }}>
          {error || '상품을 찾을 수 없습니다.'}
        </div>
        <button 
          onClick={() => navigate('/')}
          style={{
            padding: '12px 24px',
            backgroundColor: '#2c5aa0',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          홈으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fff' }}>
      <Navbar 
        user={user} 
        isAdmin={isAdminUser} 
        onLogout={handleLogout}
        cartItemCount={cartItemCount}
      />
      
      <main style={{ paddingTop: '80px' }}>
        {/* 상품 상세 정보 */}
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '40px 20px'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : '1fr 1fr',
            gap: window.innerWidth <= 768 ? '30px' : '60px'
          }}>
            {/* 상품 이미지 */}
            <div style={{
              backgroundColor: '#f8f9fa',
              borderRadius: '12px',
              padding: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '500px'
            }}>
              <img 
                src={product.image?.url || '/placeholder-image.jpg'} 
                alt={product.image?.alt || product.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  maxHeight: '500px'
                }}
                onError={(e) => {
                  e.target.src = '/placeholder-image.jpg';
                }}
              />
            </div>

            {/* 상품 정보 */}
            <div style={{ padding: '20px 0' }}>
              {/* 카테고리 */}
              <div style={{
                fontSize: '14px',
                color: '#666',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '12px'
              }}>
                {product.category}
              </div>

              {/* 상품명 */}
              <h1 style={{
                fontSize: '28px',
                fontWeight: '700',
                marginBottom: '8px',
                color: '#333'
              }}>
                {product.name}
              </h1>
              
              {/* 별점 및 리뷰 */}
              <div style={{ marginBottom: '16px' }}>
                <StarRating 
                  rating={4.5} 
                  reviewCount={127}
                  size={18}
                />
              </div>

              {/* 가격 */}
              <div style={{
                marginBottom: '24px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '8px'
                }}>
                  <span style={{
                    fontSize: '28px',
                    fontWeight: '700',
                    color: '#2c5aa0'
                  }}>
                    ₩{formatPrice(product.price)}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <>
                      <span style={{
                        fontSize: '20px',
                        color: '#999',
                        textDecoration: 'line-through'
                      }}>
                        ₩{formatPrice(product.originalPrice)}
                      </span>
                      <span style={{
                        fontSize: '16px',
                        color: '#e74c3c',
                        fontWeight: '600',
                        backgroundColor: '#ffe6e6',
                        padding: '4px 8px',
                        borderRadius: '4px'
                      }}>
                        -{discountPercentage}%
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* 재고 상태 */}
              <div style={{
                marginBottom: '24px',
                padding: '12px',
                backgroundColor: product.stock > 0 ? '#e8f5e8' : '#ffe6e6',
                borderRadius: '8px',
                border: `1px solid ${product.stock > 0 ? '#27ae60' : '#e74c3c'}`
              }}>
                <span style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: product.stock > 0 ? '#27ae60' : '#e74c3c'
                }}>
                  {product.stock > 0 ? `재고 ${product.stock}개` : '품절'}
                </span>
              </div>

              {/* 색상 선택 */}
              {product.specifications?.colors && product.specifications.colors.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '16px',
                    fontWeight: '600',
                    marginBottom: '8px',
                    color: '#333'
                  }}>
                    색상
                  </label>
                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    flexWrap: 'wrap'
                  }}>
                    {product.specifications.colors.map((color, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedColor(color)}
                        style={{
                          padding: '8px 16px',
                          border: selectedColor === color ? '2px solid #2c5aa0' : '1px solid #ddd',
                          borderRadius: '6px',
                          backgroundColor: selectedColor === color ? '#f0f7ff' : '#fff',
                          color: selectedColor === color ? '#2c5aa0' : '#333',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: selectedColor === color ? '600' : '400'
                        }}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 사이즈 선택 */}
              {product.specifications?.sizes && product.specifications.sizes.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '16px',
                    fontWeight: '600',
                    marginBottom: '8px',
                    color: '#333'
                  }}>
                    사이즈
                  </label>
                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    flexWrap: 'wrap'
                  }}>
                    {product.specifications.sizes.map((size, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedSize(size)}
                        style={{
                          padding: '8px 16px',
                          border: selectedSize === size ? '2px solid #2c5aa0' : '1px solid #ddd',
                          borderRadius: '6px',
                          backgroundColor: selectedSize === size ? '#f0f7ff' : '#fff',
                          color: selectedSize === size ? '#2c5aa0' : '#333',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: selectedSize === size ? '600' : '400'
                        }}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 수량 선택 */}
              <div style={{ marginBottom: '32px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '16px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: '#333'
                }}>
                  수량
                </label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleQuantityDecrease();
                    }}
                    disabled={quantity <= 1}
                    style={{
                      width: '40px',
                      height: '40px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      backgroundColor: quantity <= 1 ? '#f5f5f5' : '#fff',
                      color: quantity <= 1 ? '#ccc' : '#333',
                      cursor: quantity <= 1 ? 'not-allowed' : 'pointer',
                      fontSize: '18px',
                      fontWeight: '600'
                    }}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (!isNaN(value) && value > 0 && value <= product.stock) {
                        setQuantity(value);
                      }
                    }}
                    style={{
                      width: '60px',
                      height: '40px',
                      textAlign: 'center',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '18px',
                      fontWeight: '600',
                      backgroundColor: '#fff',
                      color: '#333'
                    }}
                    min="1"
                    max={product.stock}
                  />
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleQuantityIncrease();
                    }}
                    disabled={quantity >= product.stock}
                    style={{
                      width: '40px',
                      height: '40px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      backgroundColor: quantity >= product.stock ? '#f5f5f5' : '#fff',
                      color: quantity >= product.stock ? '#ccc' : '#333',
                      cursor: quantity >= product.stock ? 'not-allowed' : 'pointer',
                      fontSize: '18px',
                      fontWeight: '600'
                    }}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* 장바구니 담기 버튼 */}
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0 || cartLoading}
                style={{
                  width: '100%',
                  padding: '16px',
                  backgroundColor: (product.stock === 0 || cartLoading) ? '#ccc' : '#2c5aa0',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '18px',
                  fontWeight: '600',
                  cursor: (product.stock === 0 || cartLoading) ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  if (product.stock > 0 && !cartLoading) {
                    e.target.style.backgroundColor = '#1e3d6f';
                  }
                }}
                onMouseLeave={(e) => {
                  if (product.stock > 0 && !cartLoading) {
                    e.target.style.backgroundColor = '#2c5aa0';
                  }
                }}
              >
                {cartLoading && (
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid #ffffff',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                )}
                {product.stock === 0 ? '품절' : cartLoading ? '추가 중...' : '장바구니에 담기'}
              </button>
            </div>
          </div>

          {/* 상품 설명 */}
          {product.description && (
            <div style={{
              marginTop: '60px',
              padding: '40px',
              backgroundColor: '#f8f9fa',
              borderRadius: '12px'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '700',
                marginBottom: '20px',
                color: '#333'
              }}>
                상품 설명
              </h2>
              <p style={{
                fontSize: '16px',
                lineHeight: '1.6',
                color: '#666',
                whiteSpace: 'pre-line'
              }}>
                {product.description}
              </p>
            </div>
          )}

          {/* 관련 상품 */}
          {relatedProducts.length > 0 && (
            <div style={{ marginTop: '60px' }}>
              <h2 style={{
                fontSize: '28px',
                fontWeight: '700',
                marginBottom: '30px',
                color: '#333',
                textAlign: 'center'
              }}>
                이런 상품은 어떠세요?
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '24px'
              }}>
                {relatedProducts.map((relatedProduct) => (
                  <ProductCard key={relatedProduct._id} product={relatedProduct} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProductDetailPage;