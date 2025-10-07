import axios from 'axios';

// API 기본 URL 설정
const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api';

// axios 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 - 토큰 자동 추가
api.interceptors.request.use(
  (config) => {
    console.log('=== Axios 요청 인터셉터 ===');
    console.log('요청 URL:', config.baseURL + config.url);
    console.log('요청 메서드:', config.method);
    console.log('요청 데이터:', config.data);
    
    // localStorage와 sessionStorage 모두에서 토큰 확인
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    console.log('토큰 존재 여부:', !!token);
    console.log('토큰 값 (앞 10자리):', token ? token.substring(0, 10) + '...' : 'null');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Authorization 헤더 설정됨');
    } else {
      console.log('토큰이 없어서 Authorization 헤더 설정 안됨');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 에러 처리
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // 토큰이 만료되었거나 유효하지 않은 경우
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 인증 관련 API
export const authAPI = {
  // 회원가입
  register: (userData) => api.post('/auth/register', userData),
  
  // 로그인
  login: (credentials) => api.post('/auth/login', credentials),
  
  // 로그아웃
  logout: () => api.post('/auth/logout'),
  
  // 프로필 조회
  getProfile: () => api.get('/auth/profile'),
  
  // 프로필 업데이트
  updateProfile: (userData) => api.put('/auth/profile', userData),
};

// 상품 관련 API
export const productAPI = {
  // 모든 상품 조회
  getAllProducts: (params = {}) => api.get('/products', { params }),
  
  // 상품 상세 조회
  getProduct: (id) => api.get(`/products/${id}`),
  
  // 상품 상세 조회 (별칭)
  getProductById: (id) => api.get(`/products/${id}`),
  
  // 상품 생성 (관리자)
  createProduct: (productData) => api.post('/products', productData),
  
  // 상품 업데이트 (관리자)
  updateProduct: (id, productData) => api.put(`/products/${id}`, productData),
  
  // 상품 삭제 (관리자)
  deleteProduct: (id) => api.delete(`/products/${id}`),
  
  // 카테고리별 상품 조회
  getProductsByCategory: (category, params = {}) => 
    api.get(`/products/category/${category}`, { params }),
  
  // 상품 검색
  searchProducts: (query, params = {}) => 
    api.get(`/products/search`, { params: { q: query, ...params } }),
};

// 장바구니 관련 API
export const cartAPI = {
  // 장바구니 조회
  getCart: () => api.get('/cart'),
  
  // 장바구니에 상품 추가
  addToCart: (cartData) => 
    api.post('/cart/items', cartData),
  
  // 장바구니 상품 수량 업데이트
  updateCartItem: (itemId, quantity) => 
    api.put(`/cart/items/${itemId}`, { quantity }),
  
  // 장바구니에서 상품 제거
  removeFromCart: (itemId) => api.delete(`/cart/items/${itemId}`),
  
  // 장바구니 비우기
  clearCart: () => api.delete('/cart'),
};

// 주문 관련 API
export const orderAPI = {
  // 주문 생성
  createOrder: (orderData) => api.post('/orders', orderData),
  
  // 주문 목록 조회
  getOrders: () => api.get('/orders'),
  
  // 주문 상세 조회
  getOrder: (id) => api.get(`/orders/${id}`),
  
  // 주문 취소
  cancelOrder: (id) => api.patch(`/orders/${id}/cancel`),
  
  // 관리자용 모든 주문 조회
  getAllOrders: (params = {}) => api.get('/orders/admin/all', { params }),
  
  // 관리자용 주문 상태 업데이트
  updateOrderStatus: (id, status) => api.patch(`/orders/admin/${id}/status`, { status }),
};

// 고객 관리 API (관리자용)
export const customerAPI = {
  // 모든 고객 조회
  getAllCustomers: () => api.get('/admin/customers'),
  
  // 고객 상세 조회
  getCustomer: (id) => api.get(`/admin/customers/${id}`),
  
  // 고객 정보 업데이트
  updateCustomer: (id, customerData) => api.put(`/admin/customers/${id}`, customerData),
  
  // 고객 계정 활성화/비활성화
  toggleCustomerStatus: (id) => api.put(`/admin/customers/${id}/toggle-status`),
};

// 기본 API 인스턴스 내보내기
export default api;