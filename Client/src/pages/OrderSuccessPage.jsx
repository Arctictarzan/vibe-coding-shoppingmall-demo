import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';

const OrderSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [orderData, setOrderData] = useState(null);

  useEffect(() => {
    // URL 파라미터나 state에서 주문 정보 가져오기
    const urlParams = new URLSearchParams(location.search);
    const orderNumber = urlParams.get('orderNumber');
    const paymentNumber = urlParams.get('paymentNumber');
    const amount = urlParams.get('amount');
    
    if (location.state) {
      setOrderData(location.state);
    } else if (orderNumber) {
      setOrderData({
        orderNumber,
        paymentNumber,
        amount: amount ? parseInt(amount) : 0,
        orderDate: new Date().toLocaleDateString('ko-KR')
      });
    }
  }, [location]);

  const handleLogout = () => {
    logout();
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const handleContinueShopping = () => {
    navigate('/');
  };

  const handleViewOrders = () => {
    navigate('/orders');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <Navbar 
        user={user} 
        onLogout={handleLogout}
        cartItemCount={0}
      />
      
      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto', 
        padding: '40px 20px',
        backgroundColor: 'white',
        marginTop: '20px',
        marginBottom: '20px',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        {/* 성공 아이콘 */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            backgroundColor: '#28a745',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px auto'
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: 'bold', 
            color: '#333',
            marginBottom: '10px'
          }}>
            주문이 성공적으로 완료되었습니다!
          </h1>
          <p style={{ 
            fontSize: '16px', 
            color: '#666',
            marginBottom: '5px'
          }}>
            주문해 주셔서 감사합니다.
          </p>
          <p style={{ 
            fontSize: '14px', 
            color: '#888'
          }}>
            주문 확인 이메일을 곧 받으실 수 있습니다.
          </p>
        </div>

        {/* 주문 정보 */}
        {orderData && (
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '25px',
            borderRadius: '8px',
            marginBottom: '30px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '10px' }}>
                <path d="M20 7L9 18L4 13" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <h2 style={{ 
                fontSize: '20px', 
                fontWeight: 'bold', 
                color: '#333',
                margin: 0
              }}>
                주문 정보
              </h2>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '20px',
              marginBottom: '20px'
            }}>
              <div>
                <h3 style={{ 
                  fontSize: '14px', 
                  fontWeight: 'bold', 
                  color: '#666',
                  marginBottom: '8px'
                }}>
                  주문 번호
                </h3>
                <p style={{ 
                  fontSize: '16px', 
                  color: '#333',
                  margin: 0,
                  fontFamily: 'monospace'
                }}>
                  {orderData.orderNumber || 'ORD-' + Date.now()}
                </p>
              </div>
              <div>
                <h3 style={{ 
                  fontSize: '14px', 
                  fontWeight: 'bold', 
                  color: '#666',
                  marginBottom: '8px'
                }}>
                  주문 날짜
                </h3>
                <p style={{ 
                  fontSize: '16px', 
                  color: '#333',
                  margin: 0
                }}>
                  {orderData.orderDate || new Date().toLocaleDateString('ko-KR')}
                </p>
              </div>
            </div>

            {orderData.paymentNumber && (
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ 
                  fontSize: '14px', 
                  fontWeight: 'bold', 
                  color: '#666',
                  marginBottom: '8px'
                }}>
                  결제 번호
                </h3>
                <p style={{ 
                  fontSize: '16px', 
                  color: '#333',
                  margin: 0,
                  fontFamily: 'monospace'
                }}>
                  {orderData.paymentNumber}
                </p>
              </div>
            )}

            {orderData.amount && (
              <div style={{
                borderTop: '1px solid #dee2e6',
                paddingTop: '20px'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <h3 style={{ 
                    fontSize: '16px', 
                    fontWeight: 'bold', 
                    color: '#333',
                    margin: 0
                  }}>
                    총 결제 금액
                  </h3>
                  <p style={{ 
                    fontSize: '20px', 
                    fontWeight: 'bold',
                    color: '#28a745',
                    margin: 0
                  }}>
                    ₩{formatPrice(orderData.amount)}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 다음 단계 안내 */}
        <div style={{
          backgroundColor: '#e3f2fd',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '30px'
        }}>
          <h3 style={{ 
            fontSize: '16px', 
            fontWeight: 'bold', 
            color: '#1976d2',
            marginBottom: '15px'
          }}>
            다음 단계
          </h3>
          <div style={{ color: '#333' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginBottom: '10px' 
            }}>
              <div style={{
                width: '24px',
                height: '24px',
                backgroundColor: '#28a745',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '12px',
                fontSize: '12px',
                color: 'white',
                fontWeight: 'bold'
              }}>
                1
              </div>
              <span style={{ fontSize: '14px' }}>
                주문 확인 이메일 발송 (완료)
              </span>
            </div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginBottom: '10px' 
            }}>
              <div style={{
                width: '24px',
                height: '24px',
                backgroundColor: '#ffc107',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '12px',
                fontSize: '12px',
                color: 'white',
                fontWeight: 'bold'
              }}>
                2
              </div>
              <span style={{ fontSize: '14px' }}>
                상품 준비 중 (1-2 영업일 내)
              </span>
            </div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center' 
            }}>
              <div style={{
                width: '24px',
                height: '24px',
                backgroundColor: '#6c757d',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '12px',
                fontSize: '12px',
                color: 'white',
                fontWeight: 'bold'
              }}>
                3
              </div>
              <span style={{ fontSize: '14px' }}>
                배송 시작 (2-3 영업일 내)
              </span>
            </div>
          </div>
        </div>

        {/* 액션 버튼들 */}
        <div style={{
          display: 'flex',
          gap: '15px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={handleContinueShopping}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              padding: '12px 30px',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
          >
            쇼핑 계속하기
          </button>
          <button
            onClick={handleViewOrders}
            style={{
              backgroundColor: 'white',
              color: '#007bff',
              border: '2px solid #007bff',
              padding: '12px 30px',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#007bff';
              e.target.style.color = 'white';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'white';
              e.target.style.color = '#007bff';
            }}
          >
            주문 내역 보기
          </button>
        </div>

        {/* 고객 지원 정보 */}
        <div style={{
          textAlign: 'center',
          marginTop: '40px',
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px'
        }}>
          <h3 style={{ 
            fontSize: '16px', 
            fontWeight: 'bold', 
            color: '#333',
            marginBottom: '10px'
          }}>
            문의사항이 있으신가요?
          </h3>
          <p style={{ 
            fontSize: '14px', 
            color: '#666',
            marginBottom: '15px'
          }}>
            주문 관련 문의는 언제든지 고객센터로 연락해 주세요.
          </p>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ marginRight: '8px' }}>📧</span>
              <span style={{ fontSize: '14px', color: '#007bff' }}>
                support@cider.com
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ marginRight: '8px' }}>📞</span>
              <span style={{ fontSize: '14px', color: '#007bff' }}>
                1-800-CIDER-1
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default OrderSuccessPage;