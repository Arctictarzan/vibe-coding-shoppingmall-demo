import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user, logout, getToken } = useAuth();
  const { cartItems, cartItemCount, getTotalAmount } = useCart();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('credit-card');
  const [cardInfo, setCardInfo] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });
  const [bankInfo, setBankInfo] = useState({
    bankName: '',
    accountNumber: '',
    depositorName: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const isAdminUser = useMemo(() => {
    return user?.user_type === 'admin';
  }, [user]);

  // 에러 메시지를 에러 코드로 매핑하는 함수
  const getErrorCode = (errorMessage) => {
    if (!errorMessage) return 'UNKNOWN_ERROR';
    
    const message = errorMessage.toLowerCase();
    
    if (message.includes('취소') || message.includes('cancel')) {
      return 'USER_CANCELLED';
    } else if (message.includes('카드') || message.includes('card')) {
      return 'INVALID_CARD';
    } else if (message.includes('잔액') || message.includes('insufficient')) {
      return 'INSUFFICIENT_FUNDS';
    } else if (message.includes('네트워크') || message.includes('network')) {
      return 'NETWORK_ERROR';
    } else if (message.includes('시간') || message.includes('timeout')) {
      return 'TIMEOUT';
    } else if (message.includes('결제') || message.includes('payment')) {
      return 'PAYMENT_FAILED';
    } else {
      return 'UNKNOWN_ERROR';
    }
  };

  const handleLogout = () => {
    logout();
  };

  const totalAmount = useMemo(() => {
    try {
      return getTotalAmount ? getTotalAmount() : 0;
    } catch (error) {
      console.error('총 금액 계산 오류:', error);
      return 0;
    }
  }, [getTotalAmount]);

  const shippingFee = 0; // 무료 배송
  const tax = 0; // 세금 제거 (백엔드와 일치시키기 위해)
  const finalTotal = totalAmount + shippingFee;

  const handleInputChange = (field, value) => {
    setShippingInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // 포트원 결제 처리 함수
  const processPayment = () => {
    return new Promise((resolve, reject) => {
      if (!window.IMP) {
        reject(new Error('포트원 SDK가 로드되지 않았습니다.'));
        return;
      }

      // 결제 방법별 pg 설정
      const getPaymentConfig = () => {
        const baseConfig = {
          merchant_uid: `order_${Date.now()}`, // 주문번호
          name: `쇼핑몰 주문 (${cartItems.length}개 상품)`, // 결제명
          amount: finalTotal, // 결제금액
          buyer_email: shippingInfo.email,
          buyer_name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
          buyer_tel: shippingInfo.phone,
          buyer_addr: shippingInfo.address,
          buyer_postcode: shippingInfo.zipCode,
        };

        switch (paymentMethod) {
          case 'credit-card':
            return {
              ...baseConfig,
              pg: 'html5_inicis',
              pay_method: 'card'
            };
          case 'bank-transfer':
            return {
              ...baseConfig,
              pg: 'html5_inicis',
              pay_method: 'vbank'
            };
          case 'real-time-transfer':
            return {
              ...baseConfig,
              pg: 'html5_inicis',
              pay_method: 'trans'
            };
          case 'naver-pay':
            return {
              ...baseConfig,
              pg: 'naverpay',
              pay_method: 'card'
            };
          case 'kakao-pay':
            return {
              ...baseConfig,
              pg: 'kakaopay',
              pay_method: 'card'
            };
          case 'toss-pay':
            return {
              ...baseConfig,
              pg: 'tosspay',
              pay_method: 'card'
            };
          default:
            return {
              ...baseConfig,
              pg: 'html5_inicis',
              pay_method: 'card'
            };
        }
      };

      const paymentConfig = getPaymentConfig();

      window.IMP.request_pay(paymentConfig, (response) => {
        if (response.success) {
          // 결제 성공
          resolve({
            success: true,
            imp_uid: response.imp_uid,
            merchant_uid: response.merchant_uid,
            paid_amount: response.paid_amount,
            apply_num: response.apply_num
          });
        } else {
          // 결제 실패
          reject(new Error(response.error_msg || '결제가 취소되었습니다.'));
        }
      });
    });
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    
    // 결제 금액 디버깅 로그
    console.log('결제 요청 금액:', {
      totalAmount,
      shippingFee,
      tax,
      finalTotal,
      cartItems: cartItems.length
    });
    
    try {
      // 입력 정보 검증
      if (!shippingInfo.firstName || !shippingInfo.lastName || !shippingInfo.email || 
          !shippingInfo.phone || !shippingInfo.address || !shippingInfo.city || !shippingInfo.zipCode) {
        alert('배송 정보를 모두 입력해주세요.');
        setCurrentStep(1);
        return;
      }

      // 무통장입금의 경우 입금자명 확인
      if (paymentMethod === 'bank-transfer' && !bankInfo.depositorName) {
        alert('입금자명을 입력해주세요.');
        return;
      }

      // 신용카드의 경우 카드 정보 확인
      if (paymentMethod === 'credit-card' && 
          (!cardInfo.cardNumber || !cardInfo.expiryDate || !cardInfo.cvv || !cardInfo.cardholderName)) {
        alert('카드 정보를 모두 입력해주세요.');
        return;
      }

      // 포트원 결제 처리
      const paymentResult = await processPayment();
      
      if (paymentResult.success) {
        // 결제 성공 시 서버에서 결제 검증 및 주문 생성
        console.log('결제 성공:', paymentResult);
        
        try {
          // 인증 토큰 확인
          const token = getToken();
          if (!token) {
            throw new Error('로그인이 필요합니다. 다시 로그인해주세요.');
          }

          const payload = {
            imp_uid: paymentResult.imp_uid,
            merchant_uid: paymentResult.merchant_uid,
            amount: Number(paymentResult.paid_amount ?? finalTotal), // 숫자 보장
            // 서버가 검증에 사용하기 쉽게 스냅샷도 함께 전달(권장)
            order: {
              items: cartItems.map(ci => ({
                productId: ci.product?._id,
                name: ci.product?.name,
                price: ci.product?.salePrice ?? ci.product?.price ?? 0,
                quantity: ci.quantity ?? 1,
                size: ci.size,
                color: ci.color,
              })),
              subtotal: Number(totalAmount),
              shippingFee: Number(shippingFee),
              // tax: Number(tax), // 필요시
              finalTotal: Number(finalTotal),
            },
            shipping: {
              recipientName: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
              phone: shippingInfo.phone,
              zipCode: shippingInfo.zipCode,
              address: shippingInfo.address,
              detailAddress: shippingInfo.city || '',
              email: shippingInfo.email
            },
            payment: {
              method: paymentMethod,
              ...(paymentMethod === 'bank-transfer' && { depositorName: bankInfo.depositorName }),
              ...(paymentMethod === 'credit-card' && {
                cardNumber: cardInfo.cardNumber?.slice(-4),
                cardholderName: cardInfo.cardholderName
              })
            }
          };

          const verificationResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/verify-payment`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,   // 이미 얻은 token 사용
            },
            body: JSON.stringify(payload)
          });

          // 200 이외 처리: 본문을 text로 우선 읽어서 로그 남기기
          if (!verificationResponse.ok) {
            const raw = await verificationResponse.text().catch(() => '');
            console.error('verify-payment non-OK:', verificationResponse.status, raw);
            throw new Error(raw || `결제 검증 API 오류 (HTTP ${verificationResponse.status})`);
          }

          const verificationData = await verificationResponse.json();
          if (!verificationData?.success) {
            throw new Error(verificationData?.message || '서버 결제 검증에 실패했습니다.');
          }

          if (verificationData.success) {
            // 서버 검증 성공 - 주문 성공 페이지로 이동
            const orderData = {
              orderNumber: paymentResult.merchant_uid,
              paymentNumber: paymentResult.imp_uid,
              amount: paymentResult.paid_amount || finalTotal,
              orderDate: new Date().toLocaleDateString('ko-KR'),
              items: cartItems,
              shippingInfo: shippingInfo,
              paymentMethod: paymentMethod,
              orderId: verificationData.data.order._id
            };
            
            navigate('/order-success', { 
              state: orderData,
              replace: true 
            });
          } else {
            // 서버 검증 실패
            throw new Error(verificationData.message || '서버 결제 검증에 실패했습니다.');
          }
        } catch (verificationError) {
          console.error('서버 결제 검증 오류:', verificationError);
          
          // 검증 실패 시 실패 페이지로 이동
          const errorData = {
            errorCode: 'VERIFICATION_FAILED',
            errorMessage: verificationError.message || '서버 결제 검증 중 오류가 발생했습니다.',
            timestamp: new Date().toLocaleString('ko-KR'),
            orderAmount: finalTotal,
            paymentMethod: paymentMethod,
            paymentNumber: paymentResult.imp_uid
          };
          
          navigate('/order-failure', { 
            state: errorData,
            replace: true 
          });
        }
      }
    } catch (error) {
      console.error('결제 처리 오류:', error);
      
      // 결제 실패 페이지로 이동
      const errorData = {
        errorCode: getErrorCode(error.message),
        errorMessage: error.message || '결제 처리 중 오류가 발생했습니다.',
        timestamp: new Date().toLocaleString('ko-KR'),
        orderAmount: finalTotal,
        paymentMethod: paymentMethod
      };
      
      navigate('/order-failure', { 
        state: errorData,
        replace: true 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (!cartItems || cartItems.length === 0) {
      navigate('/cart');
      return;
    }

    // 포트원 SDK 초기화
    if (window.IMP) {
      window.IMP.init('imp63533650'); // 고객사 식별코드
    }
  }, [user, cartItems, navigate]);

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
    marginBottom: '20px'
  };

  const stepIndicatorStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '40px'
  };

  const stepStyle = (stepNumber) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: currentStep >= stepNumber ? 'var(--text-color, #000000)' : 'var(--text-secondary, #cccccc)'
  });

  const stepCircleStyle = (stepNumber) => ({
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: currentStep >= stepNumber ? 'var(--text-color, #000000)' : 'var(--text-secondary, #cccccc)',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '600'
  });

  const contentStyle = {
    display: 'flex',
    gap: '40px',
    alignItems: 'flex-start'
  };

  const formSectionStyle = {
    flex: '2',
    backgroundColor: 'var(--bg-color, #ffffff)'
  };

  const orderSummaryStyle = {
    flex: '1',
    backgroundColor: 'var(--card-bg, #f8f9fa)',
    padding: '30px',
    borderRadius: '8px',
    position: 'sticky',
    top: '120px'
  };

  const sectionTitleStyle = {
    fontSize: '20px',
    fontWeight: '600',
    color: 'var(--text-color, #000000)',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  };

  const formGroupStyle = {
    marginBottom: '20px'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: 'var(--text-color, #333333)',
    marginBottom: '8px'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    border: '1px solid var(--border-color, #ddd)',
    borderRadius: '4px',
    fontSize: '14px',
    fontFamily: 'inherit',
    backgroundColor: 'var(--card-bg, #ffffff)',
    color: 'var(--text-color, #000000)'
  };

  const rowStyle = {
    display: 'flex',
    gap: '15px'
  };

  const buttonStyle = {
    padding: '12px 24px',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.2s'
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: 'var(--text-color, #000000)',
    color: 'var(--bg-color, #ffffff)'
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: 'var(--bg-color, #ffffff)',
    color: 'var(--text-color, #000000)',
    border: '1px solid var(--border-color, #ddd)'
  };

  const orderItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    padding: '15px 0',
    borderBottom: '1px solid var(--border-color, #e9ecef)',
    color: 'var(--text-color, #000000)'
  };

  const itemImageStyle = {
    width: '60px',
    height: '72px',
    objectFit: 'cover',
    borderRadius: '4px'
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

  if (!cartItems || cartItems.length === 0) {
    return null;
  }

  return (
    <div style={pageStyle}>
      <Navbar 
        user={user} 
        onLogout={handleLogout} 
        isAdmin={isAdminUser}
        cartItemCount={cartItemCount}
      />
      
      <div style={containerStyle}>
        <div style={headerStyle}>
          <h1 style={titleStyle}>Checkout</h1>
          
          <div style={stepIndicatorStyle}>
            <div style={stepStyle(1)}>
              <div style={stepCircleStyle(1)}>1</div>
              <span>Shipping</span>
            </div>
            <div style={{ width: '40px', height: '2px', backgroundColor: currentStep >= 2 ? '#000000' : '#cccccc' }}></div>
            <div style={stepStyle(2)}>
              <div style={stepCircleStyle(2)}>2</div>
              <span>Payment</span>
            </div>
            <div style={{ width: '40px', height: '2px', backgroundColor: currentStep >= 3 ? '#000000' : '#cccccc' }}></div>
            <div style={stepStyle(3)}>
              <div style={stepCircleStyle(3)}>3</div>
              <span>Review</span>
            </div>
          </div>
        </div>

        <div style={contentStyle}>
          <div style={formSectionStyle}>
            {currentStep === 1 && (
              <div>
                <div style={sectionTitleStyle}>
                  <span>📦</span>
                  Shipping Information
                </div>
                
                <div style={rowStyle}>
                  <div style={{ ...formGroupStyle, flex: 1 }}>
                    <label style={labelStyle}>First Name</label>
                    <input
                      type="text"
                      style={inputStyle}
                      value={shippingInfo.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      placeholder="John"
                    />
                  </div>
                  <div style={{ ...formGroupStyle, flex: 1 }}>
                    <label style={labelStyle}>Last Name</label>
                    <input
                      type="text"
                      style={inputStyle}
                      value={shippingInfo.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>Email</label>
                  <input
                    type="email"
                    style={inputStyle}
                    value={shippingInfo.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="john@example.com"
                  />
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>Phone Number</label>
                  <input
                    type="tel"
                    style={inputStyle}
                    value={shippingInfo.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>Address</label>
                  <input
                    type="text"
                    style={inputStyle}
                    value={shippingInfo.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="123 Main Street"
                  />
                </div>

                <div style={rowStyle}>
                  <div style={{ ...formGroupStyle, flex: 1 }}>
                    <label style={labelStyle}>City</label>
                    <input
                      type="text"
                      style={inputStyle}
                      value={shippingInfo.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="New York"
                    />
                  </div>
                  <div style={{ ...formGroupStyle, flex: 1 }}>
                    <label style={labelStyle}>ZIP Code</label>
                    <input
                      type="text"
                      style={inputStyle}
                      value={shippingInfo.zipCode}
                      onChange={(e) => handleInputChange('zipCode', e.target.value)}
                      placeholder="10001"
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
                  <button 
                    style={secondaryButtonStyle}
                    onClick={() => navigate('/cart')}
                  >
                    ← Back to Cart
                  </button>
                  <button 
                    style={primaryButtonStyle}
                    onClick={handleNextStep}
                  >
                    Continue to Payment →
                  </button>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div>
                <div style={sectionTitleStyle}>
                  <span>💳</span>
                  Payment Method
                </div>
                
                <div style={{ marginBottom: '30px' }}>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '1fr 1fr', 
                      gap: '15px', 
                      marginBottom: '20px' 
                    }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--text-color, #000000)' }}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="credit-card"
                          checked={paymentMethod === 'credit-card'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                        />
                        <span>신용카드/체크카드</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--text-color, #000000)' }}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="bank-transfer"
                          checked={paymentMethod === 'bank-transfer'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                        />
                        <span>무통장입금</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--text-color, #000000)' }}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="real-time-transfer"
                          checked={paymentMethod === 'real-time-transfer'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                        />
                        <span>실시간계좌이체</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--text-color, #000000)' }}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="naver-pay"
                          checked={paymentMethod === 'naver-pay'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                        />
                        <span>네이버페이</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--text-color, #000000)' }}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="kakao-pay"
                          checked={paymentMethod === 'kakao-pay'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                        />
                        <span>카카오페이</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="toss-pay"
                          checked={paymentMethod === 'toss-pay'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                        />
                        <span>토스페이</span>
                      </label>
                    </div>

                  {paymentMethod === 'credit-card' && (
                    <div>
                      <div style={formGroupStyle}>
                        <label style={labelStyle}>Card Number</label>
                        <input
                          type="text"
                          style={inputStyle}
                          placeholder="카드 번호 (1234-5678-9012-3456)"
                          value={cardInfo.cardNumber}
                          onChange={(e) => setCardInfo({...cardInfo, cardNumber: e.target.value})}
                        />
                      </div>
                      <div style={rowStyle}>
                        <div style={{ ...formGroupStyle, flex: 1 }}>
                          <label style={labelStyle}>Expiry Date</label>
                          <input
                            type="text"
                            style={inputStyle}
                            placeholder="MM/YY"
                            value={cardInfo.expiryDate}
                            onChange={(e) => setCardInfo({...cardInfo, expiryDate: e.target.value})}
                          />
                        </div>
                        <div style={{ ...formGroupStyle, flex: 1 }}>
                          <label style={labelStyle}>CVV</label>
                          <input
                            type="text"
                            style={inputStyle}
                            placeholder="CVV"
                            value={cardInfo.cvv}
                            onChange={(e) => setCardInfo({...cardInfo, cvv: e.target.value})}
                          />
                        </div>
                      </div>
                      <div style={formGroupStyle}>
                        <label style={labelStyle}>Cardholder Name</label>
                        <input
                          type="text"
                          style={inputStyle}
                          placeholder="카드 소유자명"
                          value={cardInfo.cardholderName}
                          onChange={(e) => setCardInfo({...cardInfo, cardholderName: e.target.value})}
                        />
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'bank-transfer' && (
                    <div style={{
                      padding: '20px',
                      backgroundColor: 'var(--card-bg, #f8f9fa)',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color, #e9ecef)'
                    }}>
                      <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '15px', color: 'var(--text-color, #000000)' }}>입금 계좌 정보</h4>
                      <div style={{ marginBottom: '10px', color: 'var(--text-color, #000000)' }}><strong>은행:</strong> 국민은행</div>
                      <div style={{ marginBottom: '10px', color: 'var(--text-color, #000000)' }}><strong>계좌번호:</strong> 123-456-789012</div>
                      <div style={{ marginBottom: '15px', color: 'var(--text-color, #000000)' }}><strong>예금주:</strong> (주)쇼핑몰</div>
                      <div style={{ 
                          padding: '10px', 
                          backgroundColor: 'var(--warning-bg, #fff3cd)', 
                          borderRadius: '4px',
                          fontSize: '14px',
                          color: 'var(--warning-text, #856404)'
                        }}>
                          주문 후 24시간 내 입금해주세요. 입금자명은 주문자명과 동일해야 합니다.
                        </div>
                      <div style={{ ...formGroupStyle, marginTop: '15px' }}>
                        <label style={labelStyle}>입금자명</label>
                        <input
                          type="text"
                          style={inputStyle}
                          placeholder="입금자명"
                          value={bankInfo.depositorName}
                          onChange={(e) => setBankInfo({...bankInfo, depositorName: e.target.value})}
                        />
                      </div>
                    </div>
                  )}

                  {(paymentMethod === 'real-time-transfer' || 
                    paymentMethod === 'naver-pay' || 
                    paymentMethod === 'kakao-pay' || 
                    paymentMethod === 'toss-pay') && (
                    <div style={{ 
                      padding: '20px', 
                      backgroundColor: 'var(--card-bg, #e8f5e8)', 
                      borderRadius: '8px',
                      textAlign: 'center',
                      border: '1px solid var(--border-color, #d4edda)'
                    }}>
                      <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '10px', color: 'var(--text-color, #000000)' }}>
                        선택하신 결제 방법으로 안전하게 결제됩니다.
                      </div>
                      <div style={{ fontSize: '14px', color: 'var(--text-secondary, #666666)', marginBottom: '8px' }}>
                        토스페이먼츠를 통한 안전한 결제 시스템
                      </div>
                      {paymentMethod === 'real-time-transfer' && (
                        <div style={{ fontSize: '14px', color: 'var(--text-secondary, #666666)' }}>
                          실시간으로 계좌에서 바로 결제됩니다.
                        </div>
                      )}
                      {(paymentMethod === 'naver-pay' || paymentMethod === 'kakao-pay' || paymentMethod === 'toss-pay') && (
                        <div style={{ fontSize: '14px', color: 'var(--text-secondary, #666666)' }}>
                          간편결제로 빠르고 안전하게 결제하세요.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
                  <button 
                    style={secondaryButtonStyle}
                    onClick={handlePrevStep}
                  >
                    ← Back to Shipping
                  </button>
                  <button 
                    style={primaryButtonStyle}
                    onClick={handleNextStep}
                  >
                    Review Order →
                  </button>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div>
                <div style={sectionTitleStyle}>
                  <span>📋</span>
                  Review Your Order
                </div>
                
                <div style={{ marginBottom: '30px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '15px', color: 'var(--text-color, #000000)' }}>
                    Order Items ({cartItems.length} items)
                  </h4>
                  <div style={{ 
                    backgroundColor: 'var(--card-bg, #f8f9fa)', 
                    borderRadius: '4px',
                    padding: '15px',
                    border: '1px solid var(--border-color, #e9ecef)'
                  }}>
                    {cartItems.map((item, index) => (
                      <div key={item._id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px',
                        padding: '15px 0',
                        borderBottom: index < cartItems.length - 1 ? '1px solid var(--border-color, #e9ecef)' : 'none'
                      }}>
                        <img 
                          src={item.product?.image?.url || item.product?.images?.[0] || '/placeholder-image.svg'}
                          alt={item.product?.name}
                          style={{
                            width: '60px',
                            height: '72px',
                            objectFit: 'cover',
                            borderRadius: '4px'
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px', color: 'var(--text-color, #000000)' }}>
                            {item.product?.name}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary, #666666)', marginBottom: '4px' }}>
                            Size: {item.size} • Color: {item.color}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary, #666666)', marginBottom: '4px' }}>
                            Quantity: {item.quantity}
                          </div>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-color, #000000)' }}>
                            ₩{(item.product?.salePrice || item.product?.price || 0).toLocaleString()}
                          </div>
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-color, #000000)' }}>
                          ₩{((item.product?.salePrice || item.product?.price || 0) * item.quantity).toLocaleString()}
                        </div>
                      </div>
                    ))}
                    
                    <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid var(--border-color, #e9ecef)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: 'var(--text-color, #000000)' }}>
                        <span>Subtotal ({cartItems.length} items)</span>
                        <span>₩{totalAmount.toLocaleString()}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: 'var(--text-color, #000000)' }}>
                        <span>Shipping</span>
                        <span>{shippingFee === 0 ? 'FREE' : `₩${shippingFee.toLocaleString()}`}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '700', color: 'var(--text-color, #000000)' }}>
                        <span>Total</span>
                        <span>₩{finalTotal.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '30px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '15px', color: 'var(--text-color, #000000)' }}>
                    Shipping Information
                  </h4>
                  <div style={{ 
                    padding: '15px', 
                    backgroundColor: 'var(--card-bg, #f8f9fa)', 
                    borderRadius: '4px',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    color: 'var(--text-color, #000000)'
                  }}>
                    <div>{shippingInfo.firstName} {shippingInfo.lastName}</div>
                    <div>{shippingInfo.email}</div>
                    <div>{shippingInfo.phone}</div>
                    <div>{shippingInfo.address}</div>
                    <div>{shippingInfo.city}, {shippingInfo.zipCode}</div>
                  </div>
                </div>

                <div style={{ marginBottom: '30px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '15px', color: 'var(--text-color, #000000)' }}>
                    Payment Method
                  </h4>
                  <div style={{ 
                    padding: '15px', 
                    backgroundColor: 'var(--card-bg, #f8f9fa)', 
                    borderRadius: '4px',
                    fontSize: '14px',
                    color: 'var(--text-color, #000000)'
                  }}>
                    {paymentMethod === 'credit-card' && '신용카드/체크카드'}
                    {paymentMethod === 'bank-transfer' && '무통장입금'}
                    {paymentMethod === 'real-time-transfer' && '실시간계좌이체'}
                    {paymentMethod === 'naver-pay' && '네이버페이'}
                    {paymentMethod === 'kakao-pay' && '카카오페이'}
                    {paymentMethod === 'toss-pay' && '토스페이'}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
                  <button 
                    style={secondaryButtonStyle}
                    onClick={handlePrevStep}
                  >
                    ← Back to Payment
                  </button>
                  <button 
                    style={{
                      ...primaryButtonStyle,
                      backgroundColor: isProcessing ? '#cccccc' : '#000000',
                      cursor: isProcessing ? 'not-allowed' : 'pointer'
                    }}
                    onClick={handlePlaceOrder}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processing...' : '🔒 PLACE ORDER'}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div style={orderSummaryStyle}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', color: 'var(--text-color, #000000)' }}>
              Order Summary
            </h3>
            
            {cartItems.map((item, index) => (
              <div key={item._id} style={orderItemStyle}>
                <div style={{ position: 'relative' }}>
                  <img 
                    src={item.product?.image?.url || item.product?.images?.[0] || '/placeholder-image.svg'}
                    alt={item.product?.name}
                    style={itemImageStyle}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    backgroundColor: 'var(--text-color, #000000)',
                    color: 'var(--bg-color, #ffffff)',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {index + 1}
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
                    {item.product?.name}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary, #666666)', marginBottom: '4px' }}>
                    {item.size} • {item.color}
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '600' }}>
                    ₩{(item.product?.salePrice || item.product?.price || 0).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
            
            <div style={{ marginTop: '20px' }}>
              <div style={summaryRowStyle}>
                <span>Subtotal ({cartItems.length} items)</span>
                <span>₩{totalAmount.toLocaleString()}</span>
              </div>
              
              <div style={summaryRowStyle}>
                <span>Shipping</span>
                <span>{shippingFee === 0 ? 'FREE' : `₩${shippingFee.toLocaleString()}`}</span>
              </div>
              
              <div style={totalRowStyle}>
                <span>Total</span>
                <span>₩{finalTotal.toLocaleString()}</span>
              </div>
            </div>

            <div style={{ 
              marginTop: '20px', 
              padding: '15px', 
              backgroundColor: 'var(--card-bg, #e8f5e8)', 
              borderRadius: '4px',
              textAlign: 'center',
              fontSize: '12px',
              color: 'var(--text-secondary, #666666)'
            }}>
              🔒 Secure SSL encrypted checkout
              <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                <span>VISA</span>
                <span>MC</span>
                <span>AMEX</span>
                <span>PAYPAL</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default CheckoutPage;