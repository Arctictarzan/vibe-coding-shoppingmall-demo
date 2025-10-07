import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 주문 상태 매핑 함수
  const mapOrderStatus = (status) => {
    const statusMap = {
      'order_confirmed': '주문완료',
      'preparing': '상품준비중',
      'shipping_started': '배송시작',
      'in_delivery': '배송중',
      'delivered': '배송완료',
      'cancelled': '주문취소'
    };
    return statusMap[status] || status;
  };

  // 가격 포맷팅 함수
  const formatPrice = (price) => {
    if (typeof price !== 'number') return '0';
    return price.toLocaleString();
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 주문 상세 정보 가져오기
  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        console.log('=== 주문 상세 페이지 디버깅 ===');
        console.log('주문 ID:', orderId);
        console.log('주문 ID 타입:', typeof orderId);
        console.log('주문 ID 길이:', orderId?.length);
        console.log('토큰 존재:', !!token);
        
        if (!token) {
          navigate('/login');
          return;
        }

        const apiUrl = `http://localhost:5000/api/orders/${orderId}`;
        console.log('API 요청 URL:', apiUrl);

        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('API 응답 상태:', response.status, response.statusText);

        if (response.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }

        if (!response.ok) {
          throw new Error('주문 정보를 가져오는데 실패했습니다.');
        }

        const data = await response.json();
        console.log('주문 상세 API 응답:', data);
        
        if (data.success && data.data) {
          setOrder(data.data);
        } else {
          throw new Error(data.message || '주문 정보를 가져오는데 실패했습니다.');
        }
      } catch (error) {
        console.error('주문 상세 정보 가져오기 오류:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (orderId && orderId !== 'undefined' && orderId.trim() !== '') {
      fetchOrderDetail();
    } else {
      setError('유효하지 않은 주문 ID입니다.');
      setLoading(false);
    }
  }, [orderId, navigate]);

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar 
          user={user} 
          onLogout={handleLogout}
          cartItemCount={0}
        />
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          fontSize: '18px',
          color: '#666'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #007bff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginRight: '16px'
          }}></div>
          주문 정보를 불러오는 중...
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar 
          user={user} 
          onLogout={handleLogout}
          cartItemCount={0}
        />
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center',
          padding: '40px 20px'
        }}>
          <div style={{ fontSize: '24px', color: '#dc3545', marginBottom: '16px' }}>
            ⚠️ 오류 발생
          </div>
          <div style={{ fontSize: '16px', color: '#666', marginBottom: '24px' }}>
            {error}
          </div>
          <button 
            onClick={() => navigate('/orders')}
            style={{
              padding: '12px 24px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            주문 목록으로 돌아가기
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar 
          user={user} 
          onLogout={handleLogout}
          cartItemCount={0}
        />
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center',
          padding: '40px 20px'
        }}>
          <div style={{ fontSize: '24px', color: '#666', marginBottom: '16px' }}>
            📦 주문을 찾을 수 없습니다
          </div>
          <button 
            onClick={() => navigate('/orders')}
            style={{
              padding: '12px 24px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            주문 목록으로 돌아가기
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar 
        user={user} 
        onLogout={handleLogout}
        cartItemCount={0}
      />
      
      <div style={{ flex: 1, backgroundColor: '#f8f9fa', padding: '40px 20px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {/* 헤더 */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '32px'
          }}>
            <div>
              <h1 style={{ 
                fontSize: '28px', 
                fontWeight: '700', 
                color: '#333',
                margin: '0 0 8px 0'
              }}>
                주문 상세 정보
              </h1>
              <p style={{ 
                fontSize: '16px', 
                color: '#666',
                margin: 0
              }}>
                주문번호: {order.orderNumber}
              </p>
            </div>
            <button 
              onClick={() => navigate('/orders')}
              style={{
                padding: '10px 20px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              목록으로
            </button>
          </div>

          {/* 주문 정보 카드 */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '32px',
            marginBottom: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            {/* 주문 상태 및 기본 정보 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '24px',
              marginBottom: '32px',
              padding: '24px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px'
            }}>
              <div>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>주문 상태</div>
                <div style={{ 
                  fontSize: '18px', 
                  fontWeight: '600',
                  color: mapOrderStatus(order.status) === '배송완료' ? '#28a745' : 
                         mapOrderStatus(order.status) === '주문취소' ? '#dc3545' : '#007bff'
                }}>
                  {mapOrderStatus(order.status)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>주문 일시</div>
                <div style={{ fontSize: '16px', fontWeight: '500', color: '#333' }}>
                  {formatDate(order.createdAt)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>총 결제 금액</div>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#007bff' }}>
                  ₩{formatPrice(order.pricing?.total || order.totalAmount || 0)}
                </div>
              </div>
            </div>

            {/* 주문 상품 목록 */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ 
                fontSize: '20px', 
                fontWeight: '600', 
                color: '#333',
                marginBottom: '20px'
              }}>
                주문 상품
              </h3>
              
              {order.items && order.items.map((item, index) => (
                <div key={index} style={{
                  display: 'flex',
                  padding: '20px',
                  borderBottom: index < order.items.length - 1 ? '1px solid #eee' : 'none',
                  alignItems: 'center'
                }}>
                  {/* 상품 이미지 */}
                  <div style={{
                    width: '80px',
                    height: '80px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    marginRight: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                  }}>
                    {item.productSnapshot?.image ? (
                      <img 
                        src={typeof item.productSnapshot.image === 'object' ? 
                             item.productSnapshot.image.url : 
                             item.productSnapshot.image} 
                        alt={typeof item.productSnapshot.image === 'object' ? 
                             item.productSnapshot.image.alt : 
                             item.productSnapshot?.name || '상품'}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#999',
                      display: item.productSnapshot?.image ? 'none' : 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      height: '100%'
                    }}>
                      이미지 없음
                    </div>
                  </div>

                  {/* 상품 정보 */}
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#333',
                      marginBottom: '8px'
                    }}>
                      {item.productSnapshot?.name || '상품명 없음'}
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: '#666',
                      marginBottom: '4px'
                    }}>
                      수량: {item.quantity}개
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: '#666'
                    }}>
                      개당 가격: ₩{formatPrice(item.productSnapshot?.price || 0)}
                    </div>
                  </div>

                  {/* 상품 총 가격 */}
                  <div style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#333',
                    textAlign: 'right'
                  }}>
                    ₩{formatPrice(item.itemTotal || (item.productSnapshot?.price * item.quantity) || 0)}
                  </div>
                </div>
              ))}
            </div>

            {/* 배송 정보 */}
            {order.shipping && (
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ 
                  fontSize: '20px', 
                  fontWeight: '600', 
                  color: '#333',
                  marginBottom: '20px'
                }}>
                  배송 정보
                </h3>
                <div style={{
                  padding: '20px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px'
                }}>
                  <div style={{ marginBottom: '12px' }}>
                    <span style={{ fontSize: '14px', color: '#666', marginRight: '12px' }}>받는 분:</span>
                    <span style={{ fontSize: '16px', color: '#333' }}>{order.shipping.recipientName}</span>
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <span style={{ fontSize: '14px', color: '#666', marginRight: '12px' }}>연락처:</span>
                    <span style={{ fontSize: '16px', color: '#333' }}>{order.shipping.phone}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '14px', color: '#666', marginRight: '12px' }}>주소:</span>
                    <span style={{ fontSize: '16px', color: '#333' }}>
                      {order.shipping.address} {order.shipping.detailAddress}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 결제 정보 */}
            <div>
              <h3 style={{ 
                fontSize: '20px', 
                fontWeight: '600', 
                color: '#333',
                marginBottom: '20px'
              }}>
                결제 정보
              </h3>
              <div style={{
                padding: '20px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '12px'
                }}>
                  <span style={{ fontSize: '16px', color: '#666' }}>상품 금액</span>
                  <span style={{ fontSize: '16px', color: '#333' }}>
                    ₩{formatPrice(order.pricing?.subtotal || order.totalAmount || 0)}
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '12px'
                }}>
                  <span style={{ fontSize: '16px', color: '#666' }}>배송비</span>
                  <span style={{ fontSize: '16px', color: '#333' }}>
                    ₩{formatPrice(order.pricing?.shipping || 0)}
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: '12px',
                  borderTop: '2px solid #dee2e6'
                }}>
                  <span style={{ fontSize: '18px', fontWeight: '600', color: '#333' }}>총 결제 금액</span>
                  <span style={{ fontSize: '20px', fontWeight: '700', color: '#007bff' }}>
                    ₩{formatPrice(order.pricing?.total || order.totalAmount || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
      
      {/* 로딩 애니메이션 CSS */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default OrderDetailPage;