import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';

const OrderFailurePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [errorData, setErrorData] = useState(null);

  useEffect(() => {
    // URL 파라미터나 state에서 에러 정보 가져오기
    const urlParams = new URLSearchParams(location.search);
    const errorCode = urlParams.get('errorCode');
    const errorMessage = urlParams.get('errorMessage');
    
    if (location.state) {
      setErrorData(location.state);
    } else if (errorCode || errorMessage) {
      setErrorData({
        errorCode,
        errorMessage,
        timestamp: new Date().toLocaleString('ko-KR')
      });
    } else {
      setErrorData({
        errorCode: 'UNKNOWN_ERROR',
        errorMessage: '알 수 없는 오류가 발생했습니다.',
        timestamp: new Date().toLocaleString('ko-KR')
      });
    }
  }, [location]);

  const handleLogout = () => {
    logout();
  };

  const handleRetryPayment = () => {
    navigate('/checkout');
  };

  const handleGoToCart = () => {
    navigate('/cart');
  };

  const handleContactSupport = () => {
    // 실제로는 고객센터 페이지나 이메일 링크로 이동
    window.open('mailto:support@cider.com?subject=주문 결제 오류 문의&body=오류 코드: ' + (errorData?.errorCode || 'UNKNOWN'));
  };

  const getErrorDetails = (errorCode) => {
    const errorDetails = {
      'PAYMENT_FAILED': {
        title: '결제 처리 실패',
        description: '결제 과정에서 오류가 발생했습니다. 카드 정보를 확인하고 다시 시도해 주세요.',
        suggestions: [
          '카드 번호, 유효기간, CVV 번호를 다시 확인해 주세요',
          '카드 한도나 잔액을 확인해 주세요',
          '다른 결제 수단을 이용해 보세요'
        ]
      },
      'NETWORK_ERROR': {
        title: '네트워크 연결 오류',
        description: '인터넷 연결에 문제가 있어 결제를 완료할 수 없습니다.',
        suggestions: [
          '인터넷 연결 상태를 확인해 주세요',
          '잠시 후 다시 시도해 주세요',
          '다른 브라우저를 사용해 보세요'
        ]
      },
      'INVALID_CARD': {
        title: '유효하지 않은 카드',
        description: '입력하신 카드 정보가 올바르지 않습니다.',
        suggestions: [
          '카드 번호를 다시 확인해 주세요',
          '카드 유효기간을 확인해 주세요',
          '다른 카드를 사용해 보세요'
        ]
      },
      'INSUFFICIENT_FUNDS': {
        title: '잔액 부족',
        description: '카드 잔액이나 한도가 부족합니다.',
        suggestions: [
          '카드 잔액을 확인해 주세요',
          '카드 한도를 확인해 주세요',
          '다른 결제 수단을 이용해 주세요'
        ]
      },
      'TIMEOUT': {
        title: '결제 시간 초과',
        description: '결제 처리 시간이 초과되었습니다.',
        suggestions: [
          '다시 시도해 주세요',
          '인터넷 연결 상태를 확인해 주세요',
          '브라우저를 새로고침 후 다시 시도해 주세요'
        ]
      },
      'UNKNOWN_ERROR': {
        title: '알 수 없는 오류',
        description: '예상치 못한 오류가 발생했습니다.',
        suggestions: [
          '잠시 후 다시 시도해 주세요',
          '브라우저를 새로고침해 주세요',
          '문제가 지속되면 고객센터에 문의해 주세요'
        ]
      }
    };

    return errorDetails[errorCode] || errorDetails['UNKNOWN_ERROR'];
  };

  const errorDetails = errorData ? getErrorDetails(errorData.errorCode) : getErrorDetails('UNKNOWN_ERROR');

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
        {/* 실패 아이콘 */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            backgroundColor: '#dc3545',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px auto'
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: 'bold', 
            color: '#dc3545',
            marginBottom: '10px'
          }}>
            주문 처리에 실패했습니다
          </h1>
          <p style={{ 
            fontSize: '16px', 
            color: '#666',
            marginBottom: '5px'
          }}>
            {errorDetails.title}
          </p>
          <p style={{ 
            fontSize: '14px', 
            color: '#888'
          }}>
            {errorDetails.description}
          </p>
        </div>

        {/* 오류 정보 */}
        {errorData && (
          <div style={{
            backgroundColor: '#f8d7da',
            border: '1px solid #f5c6cb',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '30px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '15px'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '10px' }}>
                <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#721c24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <h3 style={{ 
                fontSize: '16px', 
                fontWeight: 'bold', 
                color: '#721c24',
                margin: 0
              }}>
                오류 세부 정보
              </h3>
            </div>

            <div style={{ marginBottom: '10px' }}>
              <span style={{ 
                fontSize: '14px', 
                fontWeight: 'bold', 
                color: '#721c24'
              }}>
                오류 코드: 
              </span>
              <span style={{ 
                fontSize: '14px', 
                color: '#721c24',
                fontFamily: 'monospace',
                marginLeft: '8px'
              }}>
                {errorData.errorCode}
              </span>
            </div>

            {errorData.errorMessage && (
              <div style={{ marginBottom: '10px' }}>
                <span style={{ 
                  fontSize: '14px', 
                  fontWeight: 'bold', 
                  color: '#721c24'
                }}>
                  오류 메시지: 
                </span>
                <span style={{ 
                  fontSize: '14px', 
                  color: '#721c24',
                  marginLeft: '8px'
                }}>
                  {errorData.errorMessage}
                </span>
              </div>
            )}

            <div>
              <span style={{ 
                fontSize: '14px', 
                fontWeight: 'bold', 
                color: '#721c24'
              }}>
                발생 시간: 
              </span>
              <span style={{ 
                fontSize: '14px', 
                color: '#721c24',
                marginLeft: '8px'
              }}>
                {errorData.timestamp}
              </span>
            </div>
          </div>
        )}

        {/* 해결 방법 제안 */}
        <div style={{
          backgroundColor: '#fff3cd',
          border: '1px solid #ffeaa7',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '30px'
        }}>
          <h3 style={{ 
            fontSize: '16px', 
            fontWeight: 'bold', 
            color: '#856404',
            marginBottom: '15px'
          }}>
            해결 방법
          </h3>
          <ul style={{ 
            margin: 0, 
            paddingLeft: '20px',
            color: '#856404'
          }}>
            {errorDetails.suggestions.map((suggestion, index) => (
              <li key={index} style={{ 
                fontSize: '14px', 
                marginBottom: '8px',
                lineHeight: '1.5'
              }}>
                {suggestion}
              </li>
            ))}
          </ul>
        </div>

        {/* 액션 버튼들 */}
        <div style={{
          display: 'flex',
          gap: '15px',
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginBottom: '30px'
        }}>
          <button
            onClick={handleRetryPayment}
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
            다시 결제하기
          </button>
          <button
            onClick={handleGoToCart}
            style={{
              backgroundColor: 'white',
              color: '#6c757d',
              border: '2px solid #6c757d',
              padding: '12px 30px',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#6c757d';
              e.target.style.color = 'white';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'white';
              e.target.style.color = '#6c757d';
            }}
          >
            장바구니로 돌아가기
          </button>
        </div>

        {/* 고객 지원 */}
        <div style={{
          textAlign: 'center',
          padding: '25px',
          backgroundColor: '#e9ecef',
          borderRadius: '8px'
        }}>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: 'bold', 
            color: '#333',
            marginBottom: '10px'
          }}>
            문제가 계속 발생하나요?
          </h3>
          <p style={{ 
            fontSize: '14px', 
            color: '#666',
            marginBottom: '20px'
          }}>
            고객센터에서 도움을 받으실 수 있습니다.
          </p>
          
          <button
            onClick={handleContactSupport}
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              padding: '12px 25px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              marginBottom: '15px'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#218838'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#28a745'}
          >
            고객센터 문의하기
          </button>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
            flexWrap: 'wrap',
            marginTop: '15px'
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

export default OrderFailurePage;