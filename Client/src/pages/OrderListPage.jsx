import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Pagination from '../components/Pagination';

const OrderListPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('전체');
  const [filteredOrders, setFilteredOrders] = useState([]);
  
  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [itemsPerPage] = useState(10);
  
  // 상태별 카운트 상태
  const [statusCounts, setStatusCounts] = useState({
    total: 0,
    pending: 0,
    preparing: 0,
    shipping: 0,
    delivered: 0,
    cancelled: 0
  });

  const tabs = [
    { key: '전체', label: '전체', count: 0 },
    { key: '주문완료', label: '주문완료', count: 0 },
    { key: '상품준비중', label: '상품준비중', count: 0 },
    { key: '배송시작', label: '배송시작', count: 0 },
    { key: '배송완료', label: '배송완료', count: 0 },
    { key: '주문취소', label: '주문취소', count: 0 }
  ];

  useEffect(() => {
    fetchOrders(currentPage);
  }, [currentPage]);

  // 사용자 상태 변화 감지하여 주문 데이터 새로고침
  useEffect(() => {
    if (user) {
      // 로그인된 상태: 주문 데이터 새로고침
      fetchOrders(1);
      setCurrentPage(1);
    } else {
      // 로그아웃된 상태: 주문 데이터 초기화
      setOrders([]);
      setFilteredOrders([]);
      setTotalOrders(0);
      setTotalPages(1);
      setCurrentPage(1);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    filterOrders();
  }, [orders, activeTab]);

  const fetchOrders = async (page = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setOrders([]);
        setTotalOrders(0);
        setTotalPages(1);
        setLoading(false);
        return;
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const requestUrl = `${API_URL}/api/orders/my-orders?page=${page}&limit=${itemsPerPage}`;
      
      const response = await fetch(requestUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const orderList = data.data?.orders || [];
        setOrders(orderList);
        setTotalOrders(data.data?.pagination?.totalOrders || orderList.length);
        setTotalPages(data.data?.pagination?.totalPages || Math.ceil(orderList.length / itemsPerPage));
        
        // 상태별 카운트 업데이트
        if (data.data?.statusCounts) {
          setStatusCounts(data.data.statusCounts);
        }
      } else if (response.status === 401) {
        localStorage.removeItem('token');
        setOrders([]);
        setTotalOrders(0);
        setTotalPages(1);
        navigate('/login');
      } else {
        setOrders([]);
        setTotalOrders(0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('주문 목록 조회 오류:', error);
      setOrders([]);
      setTotalOrders(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // 주문 취소 함수
  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('정말로 주문을 취소하시겠습니까?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('로그인이 필요합니다.');
        return;
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/orders/${orderId}/cancel`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reason: '고객 요청에 의한 취소'
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert('주문이 성공적으로 취소되었습니다.');
        // 주문 목록 새로고침
        fetchOrders(currentPage);
      } else {
        alert(data.message || '주문 취소에 실패했습니다.');
      }
    } catch (error) {
      console.error('주문 취소 오류:', error);
      alert('주문 취소 중 오류가 발생했습니다.');
    }
  };

  // 페이지 변경 핸들러
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 주문 상태 매핑 함수
  const mapOrderStatus = (status) => {
    const statusMap = {
      'order_confirmed': '주문완료',
      'preparing': '상품준비중',
      'shipping': '배송시작',
      'shipping_started': '배송시작',
      'delivered': '배송완료',
      'cancelled': '주문취소'
    };
    return statusMap[status] || status;
  };

  const filterOrders = () => {
    if (activeTab === '전체') {
      setFilteredOrders(orders);
    } else {
      const filtered = orders.filter(order => {
        const mappedStatus = mapOrderStatus(order.status);
        return mappedStatus === activeTab;
      });
      setFilteredOrders(filtered);
    }
  };

  const getTabCounts = () => {
    const counts = {
      '전체': statusCounts.total,
      '주문완료': statusCounts.pending,
      '상품준비중': statusCounts.preparing,
      '배송시작': statusCounts.shipping,
      '배송완료': statusCounts.delivered,
      '주문취소': statusCounts.cancelled
    };
    return counts;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case '주문완료': return '#007bff';
      case '상품준비중': return '#ffc107';
      case '배송시작': return '#17a2b8';
      case '배송완료': return '#28a745';
      case '주문취소': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const tabCounts = getTabCounts();

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
        <Navbar 
          user={user} 
          onLogout={handleLogout}
          cartItemCount={0}
        />
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '60vh',
          flexDirection: 'column'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #007bff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '20px'
          }}></div>
          <p style={{ color: '#666', fontSize: '16px' }}>주문 내역을 불러오는 중...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <Navbar 
        user={user} 
        onLogout={handleLogout}
        cartItemCount={0}
      />
      
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '20px',
        minHeight: 'calc(100vh - 200px)'
      }}>
        {/* 페이지 헤더 */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginBottom: '30px',
          paddingTop: '20px'
        }}>
          <button 
            onClick={() => navigate(-1)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '18px',
              color: '#333',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 0'
            }}
          >
            ← 주문 내역
          </button>
        </div>

        {/* 주문 상태 탭 */}
        <div style={{
          display: 'flex',
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '8px',
          marginBottom: '30px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          overflowX: 'auto',
          gap: '4px'
        }}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                flex: '1',
                minWidth: '120px',
                padding: '12px 16px',
                border: 'none',
                background: activeTab === tab.key ? '#007bff' : 'transparent',
                color: activeTab === tab.key ? 'white' : '#666',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: activeTab === tab.key ? '600' : '400',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              {tab.label}
              <span style={{
                backgroundColor: activeTab === tab.key ? 'rgba(255,255,255,0.2)' : '#f0f0f0',
                color: activeTab === tab.key ? 'white' : '#666',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                {tabCounts[tab.key]}
              </span>
            </button>
          ))}
        </div>

        {/* 주문 목록 */}
        <div>
          {filteredOrders.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '80px 20px',
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>📦</div>
              <h3 style={{ 
                fontSize: '18px', 
                color: '#333', 
                marginBottom: '10px',
                fontWeight: '600'
              }}>
                {activeTab === '전체' ? '주문 내역이 없습니다' : `${activeTab} 상태의 주문이 없습니다`}
              </h3>
              <p style={{ fontSize: '14px', color: '#666' }}>
                {activeTab === '전체' ? '첫 주문을 시작해보세요!' : '다른 탭에서 주문을 확인해보세요.'}
              </p>
              {!localStorage.getItem('token') && (
                <div style={{ marginTop: '20px' }}>
                  <p style={{ color: '#e74c3c', fontWeight: 'bold', fontSize: '14px' }}>
                    로그인이 필요합니다. 로그인 후 주문 내역을 확인하세요.
                  </p>
                  <button 
                    onClick={() => navigate('/login')}
                    style={{
                      marginTop: '10px',
                      padding: '10px 20px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    로그인하기
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {filteredOrders.map(order => (
                <div key={order._id} style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '24px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #f0f0f0'
                }}>
                  {/* 주문 헤더 */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px',
                    paddingBottom: '16px',
                    borderBottom: '1px solid #f0f0f0'
                  }}>
                    <div>
                      <div style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#333',
                        marginBottom: '4px'
                      }}>
                        주문 #{order.orderNumber}
                      </div>
                      <div style={{
                        fontSize: '14px',
                        color: '#666'
                      }}>
                        주문일: {formatDate(order.createdAt)}
                      </div>
                    </div>
                    <div style={{
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                      backgroundColor: getStatusColor(mapOrderStatus(order.status)) + '15',
                      color: getStatusColor(mapOrderStatus(order.status))
                    }}>
                      {mapOrderStatus(order.status)}
                    </div>
                  </div>

                  {/* 주문 상품 목록 */}
                  <div style={{ marginBottom: '20px' }}>
                    {order.items && order.items.map((item, index) => (
                      <div key={index} style={{
                        display: 'flex',
                        gap: '16px',
                        marginBottom: index < order.items.length - 1 ? '16px' : '0'
                      }}>
                        <div style={{
                          width: '80px',
                          height: '80px',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          backgroundColor: '#f8f9fa',
                          flexShrink: 0
                        }}>
                          <img 
                            src={item.product?.image?.url || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNCAzMkM0MC41Njg1IDMyIDU0IDQ1LjQzMTUgNTQgNjJDNTQgNzguNTY4NSA0MC41Njg1IDkyIDI0IDkyQzcuNDMxNDUgOTIgLTYgNzguNTY4NSAtNiA2MkMtNiA0NS40MzE1IDcuNDMxNDUgMzIgMjQgMzJaIiBmaWxsPSIjRTVFN0VCIi8+CjxwYXRoIGQ9Ik0zNiA0NEgzMlY0OEgzNlY0NFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTQ0IDUySDI0VjU2SDQ0VjUyWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K'} 
                            alt={item.product?.name || '상품 이미지'}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                            onError={(e) => {
                              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNCAzMkM0MC41Njg1IDMyIDU0IDQ1LjQzMTUgNTQgNjJDNTQgNzguNTY4NSA0MC41Njg1IDkyIDI0IDkyQzcuNDMxNDUgOTIgLTYgNzguNTY4NSAtNiA2MkMtNiA0NS40MzE1IDcuNDMxNDUgMzIgMjQgMzJaIiBmaWxsPSIjRTVFN0VCIi8+CjxwYXRoIGQ9Ik0zNiA0NEgzMlY0OEgzNlY0NFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTQ0IDUySDI0VjU2SDQ0VjUyWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
                            }}
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#333',
                            marginBottom: '8px',
                            lineHeight: '1.4'
                          }}>
                            {item.product?.name || '상품명'}
                          </h4>
                          <div style={{
                            fontSize: '14px',
                            color: '#666',
                            marginBottom: '4px'
                          }}>
                            {item.size && `사이즈: ${item.size} • `}
                            {item.color && `색상: ${item.color}`}
                          </div>
                          <div style={{
                            fontSize: '14px',
                            color: '#666'
                          }}>
                            수량: {item.quantity}
                          </div>
                        </div>
                        <div style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: '#333',
                          textAlign: 'right'
                        }}>
                          ₩{formatPrice(item.itemTotal || (item.productSnapshot?.price * item.quantity) || 0)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 주문 푸터 */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '16px',
                    borderTop: '1px solid #f0f0f0'
                  }}>
                    <div style={{
                      fontSize: '18px',
                      fontWeight: '700',
                      color: '#333'
                    }}>
                      총 결제금액: <span style={{ color: '#007bff' }}>₩{formatPrice(order.pricing?.total || order.totalAmount || 0)}</span>
                      <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                        디버그: pricing.total={order.pricing?.total} ({typeof order.pricing?.total}), totalAmount={order.totalAmount} ({typeof order.totalAmount})
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => {
                          console.log('=== 주문 상세 이동 디버깅 ===');
                          console.log('주문 객체:', order);
                          console.log('주문 ID:', order._id);
                          console.log('주문 ID 타입:', typeof order._id);
                          console.log('주문번호:', order.orderNumber);
                          
                          if (order._id) {
                            const detailUrl = `/orders/${order._id}`;
                            console.log('이동할 URL:', detailUrl);
                            navigate(detailUrl);
                          } else {
                            alert('주문 ID가 없습니다.');
                          }
                        }}
                        style={{
                          padding: '8px 16px',
                          border: '1px solid #ddd',
                          backgroundColor: 'white',
                          color: '#666',
                          borderRadius: '6px',
                          fontSize: '14px',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => {
                          e.target.style.backgroundColor = '#f8f9fa';
                          e.target.style.borderColor = '#007bff';
                          e.target.style.color = '#007bff';
                        }}
                        onMouseOut={(e) => {
                          e.target.style.backgroundColor = 'white';
                          e.target.style.borderColor = '#ddd';
                          e.target.style.color = '#666';
                        }}
                      >
                        주문상세
                      </button>
                      {(mapOrderStatus(order.status) === '배송시작' || mapOrderStatus(order.status) === '배송완료') && (
                        <button 
                          onClick={() => {
                            // 배송추적 기능 - 임시로 알림 표시
                            alert(`주문번호 ${order.orderNumber}의 배송을 추적합니다.\n\n현재 상태: ${mapOrderStatus(order.status)}\n\n실제 서비스에서는 택배사 추적 페이지로 연결됩니다.`);
                          }}
                          style={{
                            padding: '8px 16px',
                            border: '1px solid #28a745',
                            backgroundColor: 'white',
                            color: '#28a745',
                            borderRadius: '6px',
                            fontSize: '14px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseOver={(e) => {
                            e.target.style.backgroundColor = '#28a745';
                            e.target.style.color = 'white';
                          }}
                          onMouseOut={(e) => {
                            e.target.style.backgroundColor = 'white';
                            e.target.style.color = '#28a745';
                          }}
                        >
                          배송추적
                        </button>
                      )}
                      {mapOrderStatus(order.status) === '배송완료' && (
                        <button style={{
                          padding: '8px 16px',
                          border: 'none',
                          backgroundColor: '#007bff',
                          color: 'white',
                          borderRadius: '6px',
                          fontSize: '14px',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}>
                          리뷰작성
                        </button>
                      )}
                      {mapOrderStatus(order.status) === '주문완료' && (
                        <button 
                          onClick={() => handleCancelOrder(order._id)}
                          style={{
                            padding: '8px 16px',
                            border: '1px solid #dc3545',
                            backgroundColor: 'white',
                            color: '#dc3545',
                            borderRadius: '6px',
                            fontSize: '14px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#dc3545';
                            e.target.style.color = 'white';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'white';
                            e.target.style.color = '#dc3545';
                          }}
                        >
                          주문취소
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 페이지네이션 */}
         {totalPages > 1 && (
           <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'center' }}>
             <Pagination
               currentPage={currentPage}
               totalPages={totalPages}
               totalItems={totalOrders}
               itemsPerPage={itemsPerPage}
               onPageChange={handlePageChange}
             />
           </div>
         )}
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

export default OrderListPage;