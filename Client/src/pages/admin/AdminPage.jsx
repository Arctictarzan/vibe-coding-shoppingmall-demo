import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { productAPI, orderAPI, customerAPI } from '../../services/api';
import Pagination from '../../components/Pagination';

const AdminPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');

  // 주소 포맷팅 헬퍼 함수
  const formatAddress = (address) => {
    if (!address) return '';
    if (typeof address === 'string') return address;
    
    // 객체인 경우
    const parts = [
      address.country,
      address.city,
      address.street,
      address.detail
    ].filter(Boolean);
    
    return parts.join(' ');
  };
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // 상품 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(5);
  
  // 주문 페이지네이션 상태
  const [orderCurrentPage, setOrderCurrentPage] = useState(1);
  const [orderTotalPages, setOrderTotalPages] = useState(1);
  const [orderTotalItems, setOrderTotalItems] = useState(0);
  const [orderItemsPerPage] = useState(10); // 20에서 10으로 변경
  const [orderStatusFilter, setOrderStatusFilter] = useState(''); // 상태 필터 추가
  
  // 고객 관리 상태
  const [customerCurrentPage, setCustomerCurrentPage] = useState(1);
  const [customerTotalPages, setCustomerTotalPages] = useState(1);
  const [customerTotalItems, setCustomerTotalItems] = useState(0);
  const [customerItemsPerPage] = useState(10);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [customerTypeFilter, setCustomerTypeFilter] = useState('');
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [customerStats, setCustomerStats] = useState({});
  const [customerStatsLoading, setCustomerStatsLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerDetail, setShowCustomerDetail] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    password: '',
    user_type: 'customer',
    address: '',
    isActive: true
  });
  const fetchProducts = useCallback(async (page = currentPage) => {
    try {
      setLoading(true);
      console.log('관리자 페이지 - 상품 목록 요청:', { page, limit: itemsPerPage });
      
      const response = await productAPI.getAllProducts({
        page: page,
        limit: itemsPerPage
      });
      
      console.log('관리자 페이지 - 상품 목록 응답:', response.data);
      
      if (response.data.success) {
        const data = response.data.data;
        const products = data?.products || [];
        const pagination = data?.pagination || {};
        
        console.log('관리자 페이지 - 상품 데이터:', products);
        console.log('관리자 페이지 - 페이지네이션 정보:', pagination);
        
        setProducts(products);
        setCurrentPage(pagination.currentPage || 1);
        setTotalPages(pagination.totalPages || 1);
        setTotalItems(pagination.totalItems || 0);
      } else {
        setError('상품 목록을 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('상품 목록 조회 오류:', error);
      setError('상품 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage]);

  // 상품 페이지 변경 핸들러
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      console.log('관리자 페이지 - 상품 페이지 변경:', newPage);
      setCurrentPage(newPage);
      fetchProducts(newPage);
    }
  };

  // 주문 페이지 변경 핸들러
  const handleOrderPageChange = (newPage) => {
    if (newPage >= 1 && newPage <= orderTotalPages && newPage !== orderCurrentPage) {
      console.log('관리자 페이지 - 주문 페이지 변경:', newPage);
      setOrderCurrentPage(newPage);
      fetchOrders(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // 고객별 주문 통계 가져오기 (배송 정보, 결제 정보 포함)
  const fetchCustomerStats = useCallback(async (customerList) => {
    try {
      setCustomerStatsLoading(true);
      const token = localStorage.getItem('token');
      const stats = {};
      
      console.log('🔍 고객 통계 계산 시작 - 고객 수:', customerList.length);
      
      // 전체 주문 데이터 한 번에 가져오기 (더 효율적)
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders?limit=1000`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const orderData = await response.json();
        console.log('📦 전체 주문 API 응답:', orderData);
        
        if (orderData.success) {
          // API 응답 구조에 따라 주문 배열 추출
          const allOrders = Array.isArray(orderData.data?.orders) 
            ? orderData.data.orders 
            : (Array.isArray(orderData.data) ? orderData.data : []);
          
          console.log('📊 전체 주문 수:', allOrders.length);
          console.log('📋 첫 번째 주문 샘플:', allOrders[0]);
          
          // 각 고객별로 주문 필터링 및 통계 계산
          for (const customer of customerList) {
            // user._id 또는 userId로 필터링 (양쪽 다 확인)
            const customerOrders = allOrders.filter(order => {
              const userId = order.user?._id || order.user || order.userId;
              return userId === customer._id;
            });
            
            console.log(`👤 고객 ${customer.name} (${customer._id}) 주문 수:`, customerOrders.length);
            
            // 기본 통계
            const orderCount = customerOrders.length;
            const totalAmount = customerOrders.reduce((sum, order) => 
              sum + (order.pricing?.total || order.totalAmount || 0), 0
            );
            const lastOrderDate = customerOrders.length > 0 
              ? new Date(Math.max(...customerOrders.map(o => new Date(o.createdAt)))) 
              : null;

            // 배송 정보 통계
            const shippingStats = {
              totalShippingFee: customerOrders.reduce((sum, order) => 
                sum + (order.pricing?.shippingFee || 0), 0
              ),
              uniqueAddresses: [...new Set(customerOrders.map(order => 
                order.shipping?.address
              ).filter(Boolean))].length,
              hasShippingInfo: customerOrders.some(order => order.shipping?.recipientName),
              mostUsedAddress: customerOrders.length > 0 ? 
                customerOrders.map(order => order.shipping?.address).filter(Boolean)
                  .reduce((a, b, i, arr) => 
                    arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b, null
                  ) : null
            };

            // 결제 방법 통계
            const paymentMethods = customerOrders.map(order => order.payment?.method).filter(Boolean);
            const paymentStats = {
              methods: [...new Set(paymentMethods)],
              mostUsedMethod: paymentMethods.length > 0 ? 
                paymentMethods.reduce((a, b, i, arr) => 
                  arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b
                ) : null,
              completedPayments: customerOrders.filter(order => 
                order.payment?.status === 'completed'
              ).length,
              totalPaidAmount: customerOrders.filter(order => 
                order.payment?.status === 'completed'
              ).reduce((sum, order) => 
                sum + (order.pricing?.total || order.totalAmount || 0), 0
              )
            };

            stats[customer._id] = {
              orderCount,
              totalAmount,
              lastOrderDate,
              shippingStats,
              paymentStats,
              recentOrders: customerOrders.slice(0, 3) // 최근 3개 주문
            };
            
            console.log(`💰 고객 ${customer.name} 통계:`, {
              orderCount,
              totalAmount,
              lastOrderDate
            });
          }
        }
      } else {
        console.error('❌ 주문 API 호출 실패:', response.status, response.statusText);
      }
      
      console.log('📈 최종 고객 통계:', stats);
      setCustomerStats(stats);
    } catch (error) {
      console.error('❌ 고객 통계 가져오기 오류:', error);
    } finally {
      setCustomerStatsLoading(false);
    }
  }, []);

  // 고객 데이터 가져오기
  const fetchCustomers = useCallback(async (page = customerCurrentPage) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: customerItemsPerPage.toString(),
        ...(customerSearchTerm && { search: customerSearchTerm }),
        ...(customerTypeFilter && { user_type: customerTypeFilter })
      });

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('고객 데이터를 가져오는데 실패했습니다.');
      }

      const data = await response.json();
      
      if (data.success) {
        setCustomers(data.data);
        setCustomerTotalPages(data.pagination.pages);
        setCustomerTotalItems(data.pagination.total);
        setCustomerCurrentPage(page);
        
        // 각 고객의 주문 통계 가져오기
        await fetchCustomerStats(data.data);
      }
    } catch (error) {
      console.error('고객 데이터 가져오기 오류:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [customerCurrentPage, customerItemsPerPage, customerSearchTerm, customerTypeFilter, fetchCustomerStats]);

  // 고객 페이지 변경 핸들러
  const handleCustomerPageChange = (newPage) => {
    if (newPage >= 1 && newPage <= customerTotalPages && newPage !== customerCurrentPage) {
      setCustomerCurrentPage(newPage);
      fetchCustomers(newPage);
    }
  };

  // 고객 검색 핸들러
  const handleCustomerSearch = () => {
    setCustomerCurrentPage(1);
    fetchCustomers(1);
  };

  // 고객 생성
  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newCustomer)
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess('고객이 성공적으로 생성되었습니다.');
        setShowCustomerForm(false);
        setNewCustomer({
          name: '',
          email: '',
          password: '',
          user_type: 'customer',
          address: '',
          isActive: true
        });
        fetchCustomers();
      } else {
        setError(data.message || '고객 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('고객 생성 오류:', error);
      setError('고객 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 고객 상태 토글
  const handleToggleCustomerStatus = async (customerId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${customerId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess('고객 상태가 업데이트되었습니다.');
        fetchCustomers();
      } else {
        setError(data.message || '고객 상태 업데이트에 실패했습니다.');
      }
    } catch (error) {
      console.error('고객 상태 업데이트 오류:', error);
      setError('고객 상태 업데이트 중 오류가 발생했습니다.');
    }
  };

  const fetchOrders = useCallback(async (page = 1, statusFilter = orderStatusFilter, fetchAll = false) => {
    try {
      setLoading(true);
      console.log('=== 관리자 페이지 - 주문 목록 조회 시작 ===');
      console.log('현재 사용자:', user);
      console.log('토큰 존재 여부:', !!localStorage.getItem('token'));
      
      // 대시보드에서는 모든 주문 가져오기
      const limit = fetchAll ? 1000 : orderItemsPerPage;
      console.log('요청 페이지:', page, '페이지당 항목 수:', limit, '상태 필터:', statusFilter, '전체 조회:', fetchAll);
      
      // API 요청 파라미터 구성
      const params = { page, limit };
      if (statusFilter) {
        params.status = statusToServer(statusFilter);
      }
      
      const response = await orderAPI.getAllOrders(params);
      console.log('=== 관리자 페이지 - 주문 API 응답 상세 분석 ===');
      console.log('🚀 전체 응답:', response);
      console.log('🚀 응답 데이터:', response.data);
      console.log('🚀 응답 성공 여부:', response.data?.success);
      console.log('🚀 응답 메시지:', response.data?.message);
      console.log('🚀 응답 데이터 구조:', response.data?.data);
      console.log('🚀 주문 배열:', response.data?.data?.orders);
      console.log('🚀 주문 배열 타입:', typeof response.data?.data?.orders);
      console.log('🚀 주문 배열 길이:', response.data?.data?.orders?.length);
      
      if (response.data.success) {
        let orderList = response.data.data.orders || [];
        const pagination = response.data.data.pagination || {};
        
        // 클라이언트 사이드 필터링 (서버에서 필터링이 지원되지 않는 경우)
        if (statusFilter && orderList.length > 0) {
          const serverStatus = statusToServer(statusFilter);
          orderList = orderList.filter(order => order.status === serverStatus);
        }
        
        const total = pagination.totalOrders || orderList.length;
        
        console.log('✅ 추출된 주문 배열:', orderList);
        console.log('✅ 추출된 주문 배열 길이:', orderList.length);
        console.log('✅ 페이지네이션 정보:', pagination);
        console.log('✅ 총 주문 수:', total);
        
        if (orderList.length === 0 && page === 1) {
          console.error('⚠️ 관리자 페이지 - 주문이 없습니다!');
          setError(statusFilter ? `"${statusFilter}" 상태의 주문이 없습니다.` : '주문 데이터가 없습니다.');
        } else {
          console.log('✅ 주문 발견! 첫 번째 주문 정보:', orderList[0]);
          orderList.forEach((order, index) => {
            console.log(`📦 주문 ${index + 1}:`, {
              id: order._id || order.id,
              orderNumber: order.orderNumber,
              status: order.status,
              total: order.totalAmount,
              user: order.user,
              createdAt: order.createdAt,
              items: order.items?.length
            });
          });
          setSuccess(statusFilter ? 
            `"${statusFilter}" 상태의 주문 ${orderList.length}개를 조회했습니다.` : 
            `총 ${total}개의 주문 중 ${orderList.length}개를 조회했습니다.`
          );
        }
        
        setOrders(orderList);
        setOrderTotalItems(total);
        setOrderTotalPages(pagination.totalPages || Math.ceil(total / orderItemsPerPage));
        setOrderCurrentPage(page);
      } else {
        console.error('❌ API 응답 실패:', response.data?.message);
        setError(response.data?.message || '주문 목록을 불러오는데 실패했습니다.');
        setOrders([]);
        setOrderTotalItems(0);
        setOrderTotalPages(1);
      }
    } catch (error) {
      console.error('❌ 주문 목록 조회 오류:', error);
      console.error('오류 상세:', error.response?.data);
      console.error('오류 상태:', error.response?.status);
      setError(`주문 목록을 불러오는데 실패했습니다: ${error.message}`);
      setOrders([]);
      setOrderTotalItems(0);
      setOrderTotalPages(1);
    } finally {
      setLoading(false);
      console.log('=== 관리자 페이지 - 주문 목록 조회 완료 ===');
    }
  }, [orderStatusFilter, orderItemsPerPage]);

  // 상태 필터 변경 핸들러
  const handleStatusFilterChange = (newStatus) => {
    setOrderStatusFilter(newStatus);
    setOrderCurrentPage(1);
    fetchOrders(1, newStatus);
  };


  const deleteProduct = async (productId) => {
    if (!window.confirm('정말로 이 상품을 삭제하시겠습니까?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await productAPI.deleteProduct(productId);

      if (response.data.success) {
        fetchProducts(currentPage, itemsPerPage); // 상품 목록 새로고침
        setSuccess('상품이 삭제되었습니다.');
      } else {
        setError('상품 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('상품 삭제 오류:', error);
      setError('상품 삭제 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 탭 변경 시 해당 데이터 로드
  useEffect(() => {
    if (user && user.user_type === 'admin') {
      switch (activeTab) {
        case 'dashboard':
          // 대시보드는 모든 데이터 필요
          fetchProducts();
          fetchOrders(1, '', true);  // fetchAll=true로 모든 주문 가져오기
          fetchCustomers();
          break;
        case 'products':
          fetchProducts();
          break;
        case 'orders':
          setOrderCurrentPage(1);
          fetchOrders(1);
          break;
        case 'customers':
          fetchCustomers();
          break;
        default:
          break;
      }
    }
  }, [activeTab, user, fetchProducts, fetchOrders, fetchCustomers]);

  // 메시지 자동 삭제
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess('');
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    window.location.href = '/';
  };

  // 상태 값 매핑 함수들
  const statusToServer = (koreanStatus) => {
    const statusMap = {
      '주문완료': 'order_confirmed',
      '상품준비중': 'preparing',
      '배송시작': 'shipping_started',
      '배송중': 'in_delivery',
      '배송완료': 'delivered',
      '주문취소': 'cancelled'
    };
    return statusMap[koreanStatus] || koreanStatus;
  };

  const statusToKorean = (serverStatus) => {
    const statusMap = {
      'order_confirmed': '주문완료',
      'preparing': '상품준비중',
      'shipping_started': '배송시작',
      'in_delivery': '배송중',
      'delivered': '배송완료',
      'cancelled': '주문취소'
    };
    return statusMap[serverStatus] || serverStatus;
  };

  // 주문 상태 변경 함수
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setLoading(true);
      console.log('상태 변경 요청:', { orderId, newStatus });
      
      // 한글 상태를 서버 상태로 변환
      const serverStatus = statusToServer(newStatus);
      console.log('서버로 전송할 상태:', serverStatus);
      
      await orderAPI.updateOrderStatus(orderId, serverStatus);
      
      // 주문 목록 업데이트 (서버 상태를 한글로 변환하여 저장)
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === orderId 
            ? { ...order, status: serverStatus }
            : order
        )
      );
      
      setSuccess(`주문 상태가 "${newStatus}"로 변경되었습니다.`);
    } catch (error) {
      console.error('주문 상태 변경 오류:', error);
      setError('주문 상태 변경에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 주문 상태별 배경색 반환
  const getStatusColor = (status) => {
    switch (status) {
      case '주문완료': return '#e3f2fd';
      case '상품준비중': return '#fff3e0';
      case '배송시작': return '#f3e5f5';
      case '배송완료': return '#e8f5e8';
      case '주문취소': return '#ffebee';
      default: return '#f5f5f5';
    }
  };

  // 주문 상태별 텍스트 색상 반환
  const getStatusTextColor = (status) => {
    switch (status) {
      case '주문완료': return '#1976d2';
      case '상품준비중': return '#f57c00';
      case '배송시작': return '#7b1fa2';
      case '배송완료': return '#388e3c';
      case '주문취소': return '#d32f2f';
      default: return '#666';
    }
  };

  // 로딩 중일 때 로딩 화면 표시
  if (loading && !products.length && activeTab === 'products') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '40px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '18px', color: '#666' }}>로딩 중...</div>
        </div>
      </div>
    );
  }

  // 관리자 권한 확인
  if (!user || user.user_type !== 'admin') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '40px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          maxWidth: '400px'
        }}>
          <h2 style={{ color: '#dc3545', marginBottom: '20px' }}>접근 권한이 없습니다</h2>
          <p style={{ color: '#666', marginBottom: '30px' }}>관리자만 접근할 수 있는 페이지입니다.</p>
          <button
            onClick={() => window.location.href = '/'}
            style={{
              padding: '12px 24px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600'
            }}
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // 대시보드 렌더링
  const renderDashboard = () => {
    // 로딩 상태 표시
    if (loading) {
      return (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>대시보드 데이터 로딩 중...</p>
        </div>
      );
    }

    return (
      <div>
        <h2 style={{ color: '#333', marginBottom: '30px' }}>대시보드</h2>
        
        {/* 통계 카드 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          <div style={{
            backgroundColor: '#fff',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            borderLeft: '4px solid #1976d2'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#1976d2' }}>총 주문</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
              {orderTotalItems || orders.length}
            </p>
          </div>
          
          <div style={{
            backgroundColor: '#fff',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            borderLeft: '4px solid #388e3c'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#388e3c' }}>총 상품</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{totalItems}</p>
          </div>
          
          <div style={{
            backgroundColor: '#fff',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            borderLeft: '4px solid #f57c00'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#f57c00' }}>총 고객</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
              {customerTotalItems || customers.length}
            </p>
          </div>
          
          <div style={{
            backgroundColor: '#fff',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            borderLeft: '4px solid #7b1fa2'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#7b1fa2' }}>총 매출</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
              ₩{(Array.isArray(orders) ? orders : [])
                .reduce((sum, order) => sum + (order.pricing?.total || order.totalAmount || 0), 0)
                .toLocaleString()}
            </p>
            <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
              {orders.length}건 기준
            </p>
          </div>
        </div>

      {/* 최근 주문 */}
      <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h3 style={{ color: '#333', marginBottom: '15px' }}>최근 주문</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>주문번호</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>고객명</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>상품</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>상태</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>금액</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>날짜</th>
              </tr>
            </thead>
            <tbody>
              {(orders || []).slice(0, 5).map((order) => (
                <tr key={order._id}>
                  <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{order.orderNumber || (order._id || '').slice(-8).toUpperCase()}</td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{order.user?.name || order.shipping?.recipientName || '이름 없음'}</td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{order.items?.[0]?.productSnapshot?.name || order.items?.[0]?.name || '상품 정보 없음'}</td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      backgroundColor: statusToKorean(order.status) === '배송완료' ? '#d4edda' : statusToKorean(order.status) === '배송중' ? '#fff3cd' : '#d1ecf1',
                      color: statusToKorean(order.status) === '배송완료' ? '#155724' : statusToKorean(order.status) === '배송중' ? '#856404' : '#0c5460'
                    }}>
                      {statusToKorean(order.status) || '주문완료'}
                    </span>
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>₩{(order.pricing?.total || order.totalAmount || 0).toLocaleString()}</td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{order.createdAt ? new Date(order.createdAt).toLocaleDateString('ko-KR') : '날짜 없음'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    );
  };

  // 상품 관리 렌더링
  const renderProducts = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 style={{ color: '#333', margin: 0 }}>상품 관리</h2>
        <button
          onClick={() => navigate('/admin/products/create')}
          style={{
            padding: '12px 24px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600'
          }}
        >
          새 상품 등록
        </button>
      </div>

      {products.length === 0 ? (
        <div style={{
          backgroundColor: '#fff',
          padding: '40px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <p style={{ color: '#666', fontSize: '18px' }}>등록된 상품이 없습니다.</p>
        </div>
      ) : (
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>상품명</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>SKU</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>가격</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>카테고리</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>재고</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>상태</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>작업</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  // 영어 카테고리를 한글로 변환
                  const categoryDisplayMap = {
                    'tops': '상의',
                    'bottoms': '하의',
                    'accessories': '악세사리'
                  };
                  
                  return (
                    <tr key={product._id}>
                      <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {product.image?.url && (
                            <img 
                              src={product.image.url} 
                              alt={product.name}
                              style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                            />
                          )}
                          <span>{product.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{product.sku}</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>₩{product.price.toLocaleString()}</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                        {categoryDisplayMap[product.category] || product.category}
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{product.stock}</td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        backgroundColor: product.isActive ? '#d4edda' : '#f8d7da',
                        color: product.isActive ? '#155724' : '#721c24'
                      }}>
                        {product.isActive ? '활성' : '비활성'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => navigate(`/admin/products/edit/${product._id}`)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          수정
                        </button>
                        <button
                          onClick={() => deleteProduct(product._id)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* 페이지네이션 컴포넌트 */}
          {totalPages > 1 && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: '20px',
              gap: '10px'
            }}>
              {/* 이전 페이지 버튼 */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                style={{
                  padding: '8px 12px',
                  backgroundColor: currentPage === 1 ? '#f8f9fa' : '#007bff',
                  color: currentPage === 1 ? '#6c757d' : 'white',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  fontSize: '14px'
                }}
              >
                이전
              </button>

              {/* 페이지 번호 버튼들 */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = index + 1;
                } else if (currentPage <= 3) {
                  pageNum = index + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + index;
                } else {
                  pageNum = currentPage - 2 + index;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: currentPage === pageNum ? '#007bff' : 'white',
                      color: currentPage === pageNum ? 'white' : '#007bff',
                      border: '1px solid #007bff',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      minWidth: '40px'
                    }}
                  >
                    {pageNum}
                  </button>
                );
              })}

              {/* 다음 페이지 버튼 */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{
                  padding: '8px 12px',
                  backgroundColor: currentPage === totalPages ? '#f8f9fa' : '#007bff',
                  color: currentPage === totalPages ? '#6c757d' : 'white',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  fontSize: '14px'
                }}
              >
                다음
              </button>
            </div>
          )}

          {/* 페이지네이션 정보 */}
          <div style={{
            textAlign: 'center',
            marginTop: '10px',
            color: '#6c757d',
            fontSize: '14px'
          }}>
            총 {totalItems}개 상품 중 {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalItems)}개 표시 (페이지 {currentPage}/{totalPages})
          </div>
        </div>
      )}
    </div>
  );

  // 주문 관리 렌더링
  const renderOrders = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 style={{ color: '#333', margin: 0 }}>주문 관리</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <select
            value={orderStatusFilter}
            style={{
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}
            onChange={(e) => {
              handleStatusFilterChange(e.target.value);
            }}
          >
            <option value="">전체 상태</option>
            <option value="주문완료">주문완료</option>
            <option value="상품준비중">상품준비중</option>
            <option value="배송시작">배송시작</option>
            <option value="배송완료">배송완료</option>
            <option value="주문취소">주문취소</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p>주문 목록을 불러오는 중...</p>
        </div>
      ) : (
        <div style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: '600' }}>주문번호</th>
                  <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: '600' }}>고객정보</th>
                  <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: '600' }}>주문상품</th>
                  <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: '600' }}>주문금액</th>
                  <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: '600' }}>주문상태</th>
                  <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: '600' }}>주문일시</th>
                  <th style={{ padding: '15px', textAlign: 'center', borderBottom: '1px solid #ddd', fontWeight: '600' }}>관리</th>
                </tr>
              </thead>
              <tbody>
                {(orders || []).length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ padding: '50px', textAlign: 'center', color: '#666' }}>
                      주문 내역이 없습니다.
                    </td>
                  </tr>
                ) : (
                  (orders || []).map((order) => (
                    <tr key={order._id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '15px' }}>
                        <div style={{ fontWeight: '600', color: '#333' }}>
                          {order.orderNumber || (order._id || '').slice(-8).toUpperCase()}
                        </div>
                      </td>
                      <td style={{ padding: '15px' }}>
                        <div>
                          <div style={{ fontWeight: '500', marginBottom: '4px' }}>
                            {order.user?.name || order.shipping?.recipientName || '이름 없음'}
                          </div>
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            {order.user?.phone || order.shipping?.phone || '연락처 없음'}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '15px' }}>
                        <div>
                          {order.items?.length > 0 ? (
                            <div>
                              <div style={{ fontWeight: '500', marginBottom: '4px' }}>
                                {order.items[0].productSnapshot?.name || order.items[0].name || '상품명 없음'}
                              </div>
                              {order.items.length > 1 && (
                                <div style={{ fontSize: '12px', color: '#666' }}>
                                  외 {order.items.length - 1}개
                                </div>
                              )}
                            </div>
                          ) : (
                            <span style={{ color: '#666' }}>상품 정보 없음</span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '15px' }}>
                        <div style={{ fontWeight: '600', color: '#333' }}>
                          ₩{(order.pricing?.total || order.totalAmount || 0).toLocaleString()}
                        </div>
                      </td>
                      <td style={{ padding: '15px' }}>
                        <select
                          value={statusToKorean(order.status) || '주문완료'}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          style={{
                            padding: '6px 10px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            fontSize: '12px',
                            backgroundColor: getStatusColor(statusToKorean(order.status)),
                            color: getStatusTextColor(statusToKorean(order.status)),
                            fontWeight: '500'
                          }}
                        >
                          <option value="주문완료">주문완료</option>
                          <option value="상품준비중">상품준비중</option>
                          <option value="배송시작">배송시작</option>
                          <option value="배송완료">배송완료</option>
                          <option value="주문취소">주문취소</option>
                        </select>
                      </td>
                      <td style={{ padding: '15px' }}>
                        <div style={{ fontSize: '14px', color: '#666' }}>
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString('ko-KR') : '날짜 없음'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#999' }}>
                          {order.createdAt ? new Date(order.createdAt).toLocaleTimeString('ko-KR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          }) : ''}
                        </div>
                      </td>
                      <td style={{ padding: '15px', textAlign: 'center' }}>
                        <button
                          onClick={() => {
                            if (order._id) {
                              navigate(`/orders/${order._id}`);
                            } else {
                              alert('주문 ID가 없습니다.');
                            }
                          }}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '500'
                          }}
                        >
                          상세보기
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* 주문 페이지네이션 */}
          {orderTotalPages > 1 && (
            <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'center' }}>
              <Pagination
                currentPage={orderCurrentPage}
                totalPages={orderTotalPages}
                totalItems={orderTotalItems}
                itemsPerPage={orderItemsPerPage}
                onPageChange={handleOrderPageChange}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );

  // 고객 관리 렌더링
  const renderCustomers = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 style={{ color: '#333', margin: 0 }}>고객 관리</h2>
        <button
          onClick={() => setShowCustomerForm(true)}
          style={{
            padding: '12px 24px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          + 고객 추가
        </button>
      </div>

      {/* 검색 및 필터 */}
      <div style={{
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '20px',
        display: 'flex',
        gap: '15px',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <input
            type="text"
            placeholder="고객명 또는 이메일로 검색..."
            value={customerSearchTerm}
            onChange={(e) => setCustomerSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCustomerSearch()}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
        </div>
        <select
          value={customerTypeFilter}
          onChange={(e) => setCustomerTypeFilter(e.target.value)}
          style={{
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
            minWidth: '120px'
          }}
        >
          <option value="">모든 유형</option>
          <option value="customer">일반 고객</option>
          <option value="admin">관리자</option>
        </select>
        <button
          onClick={handleCustomerSearch}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          검색
        </button>
      </div>

      {/* 고객 목록 */}
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #dee2e6', fontWeight: '600' }}>고객명</th>
                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #dee2e6', fontWeight: '600' }}>이메일</th>
                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #dee2e6', fontWeight: '600' }}>유형</th>
                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #dee2e6', fontWeight: '600' }}>주문수</th>
                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #dee2e6', fontWeight: '600' }}>총 구매액</th>
                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #dee2e6', fontWeight: '600' }}>최근 주문</th>
                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #dee2e6', fontWeight: '600' }}>가입일</th>
                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #dee2e6', fontWeight: '600' }}>상태</th>
                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #dee2e6', fontWeight: '600' }}>관리</th>
              </tr>
            </thead>
            <tbody>
              {(loading || (customers.length > 0 && customerStatsLoading && Object.keys(customerStats).length === 0)) ? (
                <tr>
                  <td colSpan="9" style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                    {loading ? '고객 목록 로딩 중...' : '고객 통계 로딩 중...'}
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                    등록된 고객이 없습니다.
                  </td>
                </tr>
              ) : (
                customers.map((customer) => {
                  const stats = customerStats[customer._id] || { orderCount: 0, totalAmount: 0, lastOrderDate: null };
                  return (
                    <tr key={customer._id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '15px' }}>
                        <div style={{ fontWeight: '500', color: '#333' }}>{customer.name}</div>
                        {customer.address && (
                          <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                            {formatAddress(customer.address)}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '15px', color: '#333' }}>{customer.email}</td>
                      <td style={{ padding: '15px' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '500',
                          backgroundColor: customer.user_type === 'admin' ? '#e3f2fd' : '#f3e5f5',
                          color: customer.user_type === 'admin' ? '#1976d2' : '#7b1fa2'
                        }}>
                          {customer.user_type === 'admin' ? '관리자' : '일반 고객'}
                        </span>
                      </td>
                      <td style={{ padding: '15px', color: '#333' }}>
                        {customerStatsLoading ? (
                          <span style={{ color: '#999', fontSize: '12px' }}>로딩중...</span>
                        ) : (
                          `${stats.orderCount}건`
                        )}
                      </td>
                      <td style={{ padding: '15px', color: '#333' }}>
                        {customerStatsLoading ? (
                          <span style={{ color: '#999', fontSize: '12px' }}>로딩중...</span>
                        ) : (
                          `₩${stats.totalAmount.toLocaleString()}`
                        )}
                      </td>
                      <td style={{ padding: '15px', color: '#333' }}>
                        {customerStatsLoading ? (
                          <span style={{ color: '#999', fontSize: '12px' }}>로딩중...</span>
                        ) : (
                          stats.lastOrderDate ? 
                            stats.lastOrderDate.toLocaleDateString('ko-KR') : 
                            '주문 없음'
                        )}
                      </td>
                      <td style={{ padding: '15px', color: '#333' }}>
                        {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString('ko-KR') : '날짜 없음'}
                      </td>
                      <td style={{ padding: '15px' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '500',
                          backgroundColor: customer.isActive ? '#d4edda' : '#f8d7da',
                          color: customer.isActive ? '#155724' : '#721c24'
                        }}>
                          {customer.isActive ? '활성' : '비활성'}
                        </span>
                      </td>
                      <td style={{ padding: '15px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => {
                              setSelectedCustomer(customer);
                              setShowCustomerDetail(true);
                            }}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#007bff',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            상세 정보
                          </button>
                          <button
                            onClick={() => handleToggleCustomerStatus(customer._id, customer.isActive)}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: customer.isActive ? '#ffc107' : '#28a745',
                              color: customer.isActive ? '#212529' : 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            {customer.isActive ? '비활성화' : '활성화'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        {customerTotalPages > 1 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px',
            borderTop: '1px solid #dee2e6'
          }}>
            <Pagination
              currentPage={customerCurrentPage}
              totalPages={customerTotalPages}
              totalItems={customerTotalItems}
              itemsPerPage={customerItemsPerPage}
              onPageChange={handleCustomerPageChange}
            />
          </div>
        )}
      </div>

      {/* 고객 추가 모달 */}
      {showCustomerForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '8px',
            width: '500px',
            maxWidth: '90vw',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h3 style={{ marginBottom: '20px', color: '#333' }}>새 고객 추가</h3>
            <form onSubmit={handleCreateCustomer}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>이름</label>
                <input
                  type="text"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>이메일</label>
                <input
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>비밀번호</label>
                <input
                  type="password"
                  value={newCustomer.password}
                  onChange={(e) => setNewCustomer({...newCustomer, password: e.target.value})}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>유형</label>
                <select
                  value={newCustomer.user_type}
                  onChange={(e) => setNewCustomer({...newCustomer, user_type: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                >
                  <option value="customer">일반 고객</option>
                  <option value="admin">관리자</option>
                </select>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>주소 (선택사항)</label>
                <textarea
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})}
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowCustomerForm(false);
                    setNewCustomer({
                      name: '',
                      email: '',
                      password: '',
                      user_type: 'customer',
                      address: '',
                      isActive: true
                    });
                  }}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    opacity: loading ? 0.7 : 1
                  }}
                >
                  {loading ? '생성 중...' : '고객 추가'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* 헤더 */}
      <div style={{
        backgroundColor: '#fff',
        padding: '1rem 2rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ color: '#333', margin: 0 }}>관리자 페이지</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => window.location.href = '/'}
            style={{
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            메인 페이지
          </button>
          <button
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            로그아웃
          </button>
        </div>
      </div>

      <div style={{ display: 'flex' }}>
        {/* 사이드바 */}
        <div style={{
          width: '250px',
          backgroundColor: '#fff',
          minHeight: 'calc(100vh - 80px)',
          padding: '20px 0',
          boxShadow: '2px 0 4px rgba(0,0,0,0.1)'
        }}>
          <nav>
            {[
              { key: 'dashboard', label: '대시보드' },
              { key: 'products', label: '상품 관리' },
              { key: 'orders', label: '주문 관리' },
              { key: 'customers', label: '고객 관리' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '15px 20px',
                  backgroundColor: activeTab === tab.key ? '#007bff' : 'transparent',
                  color: activeTab === tab.key ? 'white' : '#333',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '16px',
                  transition: 'all 0.2s'
                }}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* 메인 콘텐츠 */}
        <div style={{ flex: 1, padding: '30px' }}>
          {/* 메시지 표시 */}
          {error && (
            <div style={{
              backgroundColor: '#f8d7da',
              color: '#721c24',
              padding: '12px',
              borderRadius: '6px',
              marginBottom: '20px',
              border: '1px solid #f5c6cb'
            }}>
              {error}
            </div>
          )}
          
          {success && (
            <div style={{
              backgroundColor: '#d4edda',
              color: '#155724',
              padding: '12px',
              borderRadius: '6px',
              marginBottom: '20px',
              border: '1px solid #c3e6cb'
            }}>
              {success}
            </div>
          )}

          {/* 탭별 콘텐츠 */}
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'products' && renderProducts()}
          {activeTab === 'orders' && renderOrders()}
          {activeTab === 'customers' && renderCustomers()}
        </div>
      </div>

      {/* 고객 상세 정보 모달 */}
      {showCustomerDetail && selectedCustomer && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '30px',
            maxWidth: '800px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              borderBottom: '1px solid #eee',
              paddingBottom: '15px'
            }}>
              <h2 style={{ margin: 0, color: '#333' }}>고객 상세 정보</h2>
              <button
                onClick={() => setShowCustomerDetail(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                ×
              </button>
            </div>

            {(() => {
              const stats = customerStats[selectedCustomer._id] || {};
              return (
                <div>
                  {/* 기본 정보 */}
                  <div style={{ marginBottom: '25px' }}>
                    <h3 style={{ color: '#333', marginBottom: '15px' }}>기본 정보</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                      <div>
                        <strong>이름:</strong> {selectedCustomer.name}
                      </div>
                      <div>
                        <strong>이메일:</strong> {selectedCustomer.email}
                      </div>
                      <div>
                        <strong>유형:</strong> {selectedCustomer.user_type === 'admin' ? '관리자' : '일반 고객'}
                      </div>
                      <div>
                        <strong>상태:</strong> {selectedCustomer.isActive ? '활성' : '비활성'}
                      </div>
                      <div>
                        <strong>가입일:</strong> {selectedCustomer.createdAt ? new Date(selectedCustomer.createdAt).toLocaleDateString('ko-KR') : '날짜 없음'}
                      </div>
                      {selectedCustomer.address && (
                        <div style={{ gridColumn: '1 / -1' }}>
                          <strong>주소:</strong> {formatAddress(selectedCustomer.address)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 주문 통계 */}
                  <div style={{ marginBottom: '25px' }}>
                    <h3 style={{ color: '#333', marginBottom: '15px' }}>주문 통계</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                      <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>
                          {stats.orderCount || 0}
                        </div>
                        <div style={{ fontSize: '14px', color: '#666' }}>총 주문 수</div>
                      </div>
                      <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
                          ₩{(stats.totalAmount || 0).toLocaleString()}
                        </div>
                        <div style={{ fontSize: '14px', color: '#666' }}>총 구매액</div>
                      </div>
                      <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#6c757d' }}>
                          {stats.lastOrderDate ? (stats.lastOrderDate instanceof Date ? stats.lastOrderDate.toLocaleDateString('ko-KR') : new Date(stats.lastOrderDate).toLocaleDateString('ko-KR')) : '주문 없음'}
                        </div>
                        <div style={{ fontSize: '14px', color: '#666' }}>최근 주문일</div>
                      </div>
                    </div>
                  </div>

                  {/* 배송 정보 통계 */}
                  {stats.shippingStats && (
                    <div style={{ marginBottom: '25px' }}>
                      <h3 style={{ color: '#333', marginBottom: '15px' }}>배송 정보</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div>
                          <strong>총 배송비:</strong> ₩{(stats.shippingStats.totalShippingFee || 0).toLocaleString()}
                        </div>
                        <div>
                          <strong>고유 배송지 수:</strong> {stats.shippingStats.uniqueAddresses || 0}개
                        </div>
                        {stats.shippingStats.mostUsedAddress && (
                          <div style={{ gridColumn: '1 / -1' }}>
                            <strong>주요 배송지:</strong> {stats.shippingStats.mostUsedAddress}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 결제 정보 통계 */}
                  {stats.paymentStats && (
                    <div style={{ marginBottom: '25px' }}>
                      <h3 style={{ color: '#333', marginBottom: '15px' }}>결제 정보</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div>
                          <strong>완료된 결제:</strong> {stats.paymentStats.completedPayments || 0}건
                        </div>
                        <div>
                          <strong>실제 결제액:</strong> ₩{(stats.paymentStats.totalPaidAmount || 0).toLocaleString()}
                        </div>
                        {stats.paymentStats.mostUsedMethod && (
                          <div>
                            <strong>주요 결제 방법:</strong> {stats.paymentStats.mostUsedMethod}
                          </div>
                        )}
                        {stats.paymentStats.methods && stats.paymentStats.methods.length > 0 && (
                          <div>
                            <strong>사용한 결제 방법:</strong> {stats.paymentStats.methods.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 최근 주문 목록 */}
                  {stats.recentOrders && stats.recentOrders.length > 0 && (
                    <div>
                      <h3 style={{ color: '#333', marginBottom: '15px' }}>최근 주문 (최대 3개)</h3>
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                          <thead>
                            <tr style={{ backgroundColor: '#f8f9fa' }}>
                              <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>주문일</th>
                              <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>금액</th>
                              <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>배송지</th>
                              <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>결제 방법</th>
                              <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>상태</th>
                            </tr>
                          </thead>
                          <tbody>
                            {stats.recentOrders.map((order, index) => (
                              <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '10px' }}>
                                  {new Date(order.createdAt).toLocaleDateString('ko-KR')}
                                </td>
                                <td style={{ padding: '10px' }}>
                                  ₩{(order.pricing?.total || order.totalAmount || 0).toLocaleString()}
                                </td>
                                <td style={{ padding: '10px' }}>
                                  {order.shipping?.address ? formatAddress(order.shipping.address) : '배송지 없음'}
                                </td>
                                <td style={{ padding: '10px' }}>
                                  {order.payment?.method || '결제 방법 없음'}
                                </td>
                                <td style={{ padding: '10px' }}>
                                  <span style={{
                                    padding: '2px 6px',
                                    borderRadius: '3px',
                                    fontSize: '12px',
                                    backgroundColor: order.payment?.status === 'completed' ? '#d4edda' : '#f8d7da',
                                    color: order.payment?.status === 'completed' ? '#155724' : '#721c24'
                                  }}>
                                    {order.payment?.status === 'completed' ? '결제 완료' : '결제 대기'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;