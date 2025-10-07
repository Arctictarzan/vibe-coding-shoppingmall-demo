import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  // 장바구니 아이템 수 계산
  const calculateItemCount = useCallback((items) => {
    return items.reduce((total, item) => total + item.quantity, 0);
  }, []);

  // 장바구니 데이터 가져오기
  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await cartAPI.getCart();
      
      if (response?.data?.success) {
        const cartData = response.data.data;
        const items = Array.isArray(cartData?.items) ? cartData.items : [];
        
        // 데이터 검증 및 이미지 필드 정규화
        const validItems = items.filter(item => 
          item && 
          item._id && 
          item.product && 
          typeof item.quantity === 'number' && 
          item.quantity > 0
        ).map(item => {
          // 상품 데이터 정규화
          const normalizedProduct = {
            ...item.product,
            // 이미지 필드 정규화 - 다양한 형태의 이미지 데이터를 통일
            image: item.product.image || {},
            // 기존 images 배열이 있다면 첫 번째를 image.url로 설정
            ...(item.product.images && item.product.images.length > 0 && !item.product.image?.url && {
              image: {
                ...item.product.image,
                url: item.product.images[0]
              }
            })
          };
          
          return {
            ...item,
            product: normalizedProduct
          };
        });
        
        console.log('장바구니 아이템 검증 완료:', validItems);
        
        setCartItems(validItems);
        setCartItemCount(calculateItemCount(validItems));
      } else {
        const errorMessage = response?.data?.message || '장바구니를 불러올 수 없습니다.';
        console.warn('장바구니 조회 실패:', errorMessage);
        setError(errorMessage);
        setCartItems([]);
        setCartItemCount(0);
      }
    } catch (error) {
      console.error('장바구니 조회 오류:', error);
      
      let errorMessage = '장바구니를 불러오는 중 오류가 발생했습니다.';
      
      if (error.response) {
        // 서버 응답이 있는 경우
        errorMessage = error.response.data?.message || `서버 오류 (${error.response.status})`;
      } else if (error.request) {
        // 네트워크 오류
        errorMessage = '네트워크 연결을 확인해주세요.';
      }
      
      setError(errorMessage);
      setCartItems([]);
      setCartItemCount(0);
    } finally {
      setLoading(false);
    }
  }, [calculateItemCount]);

  // 장바구니에 아이템 추가
  const addToCart = useCallback(async (productId, options = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const selectedOptions = {};
      if (options.color) selectedOptions.color = options.color;
      if (options.size) selectedOptions.size = options.size;
      
      const cartData = {
        productId,
        quantity: options.quantity || 1,
        selectedOptions
      };

      const response = await cartAPI.addToCart(cartData);
      
      if (response.data.success) {
        // 장바구니 데이터 새로고침
        await fetchCart();
        return { success: true, message: '장바구니에 추가되었습니다.' };
      } else {
        const errorMessage = response.data.message || '장바구니 추가에 실패했습니다.';
        setError(errorMessage);
        return { success: false, message: errorMessage };
      }
    } catch (error) {
      console.error('장바구니 추가 오류:', error);
      const errorMessage = error.response?.data?.message || '장바구니 추가 중 오류가 발생했습니다.';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [fetchCart]);

  // 장바구니 아이템 수량 업데이트
  const updateCartItem = useCallback(async (itemId, quantity) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await cartAPI.updateCartItem(itemId, quantity);
      
      if (response.data.success) {
        // 로컬 상태 업데이트
        setCartItems(prev => 
          prev.map(item => 
            item._id === itemId ? { ...item, quantity } : item
          )
        );
        
        // 아이템 수 재계산
        const updatedItems = cartItems.map(item => 
          item._id === itemId ? { ...item, quantity } : item
        );
        const newCount = calculateItemCount(updatedItems);
        setCartItemCount(newCount);
        
        return { success: true };
      } else {
        const errorMessage = response.data.message || '수량 업데이트에 실패했습니다.';
        setError(errorMessage);
        return { success: false, message: errorMessage };
      }
    } catch (error) {
      console.error('수량 업데이트 오류:', error);
      const errorMessage = error.response?.data?.message || '수량 업데이트 중 오류가 발생했습니다.';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [cartItems, calculateItemCount]);

  // 장바구니에서 아이템 제거
  const removeFromCart = useCallback(async (itemId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await cartAPI.removeFromCart(itemId);
      
      if (response.data.success) {
        // 로컬 상태 업데이트
        const updatedItems = cartItems.filter(item => item._id !== itemId);
        setCartItems(updatedItems);
        setCartItemCount(calculateItemCount(updatedItems));
        
        return { success: true };
      } else {
        const errorMessage = response.data.message || '아이템 삭제에 실패했습니다.';
        setError(errorMessage);
        return { success: false, message: errorMessage };
      }
    } catch (error) {
      console.error('아이템 삭제 오류:', error);
      const errorMessage = error.response?.data?.message || '아이템 삭제 중 오류가 발생했습니다.';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [cartItems, calculateItemCount]);

  // 장바구니 비우기
  const clearCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await cartAPI.clearCart();
      
      if (response.data.success) {
        setCartItems([]);
        setCartItemCount(0);
        return { success: true };
      } else {
        const errorMessage = response.data.message || '장바구니 비우기에 실패했습니다.';
        setError(errorMessage);
        return { success: false, message: errorMessage };
      }
    } catch (error) {
      console.error('장바구니 비우기 오류:', error);
      const errorMessage = error.response?.data?.message || '장바구니 비우기 중 오류가 발생했습니다.';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // 장바구니 아이템 수만 가져오기 (가벼운 요청)
  const fetchCartCount = useCallback(async () => {
    try {
      const response = await cartAPI.getCart();
      if (response.data.success) {
        const items = response.data.data.items || [];
        const count = calculateItemCount(items);
        setCartItemCount(count);
        return count;
      }
    } catch (error) {
      console.error('장바구니 수량 조회 오류:', error);
    }
    return 0;
  }, [calculateItemCount]);

  // 인증 상태 변화에 따른 장바구니 동기화
  useEffect(() => {
    console.log('CartContext: 인증 상태 변화 감지', { 
      isAuthenticated: isAuthenticated(), 
      authLoading, 
      user: !!user 
    });

    // 인증 로딩이 완료된 후에만 실행
    if (!authLoading) {
      if (isAuthenticated()) {
        // 로그인된 상태: 서버에서 장바구니 데이터 가져오기
        console.log('CartContext: 로그인 상태 - 서버에서 장바구니 데이터 로딩');
        fetchCart();
      } else {
        // 로그아웃된 상태: 장바구니 초기화
        console.log('CartContext: 로그아웃 상태 - 장바구니 초기화');
        setCartItems([]);
        setCartItemCount(0);
        setError(null);
      }
    }
  }, [isAuthenticated, authLoading, user, fetchCart]);

  // 총 금액 계산
  const getTotalAmount = useCallback(() => {
    return cartItems.reduce((total, item) => {
      const price = item.product?.salePrice || item.product?.price || 0;
      return total + (price * item.quantity);
    }, 0);
  }, [cartItems]);

  // Context 값
  const value = {
    // 상태
    cartItems,
    cartItemCount,
    loading,
    error,
    
    // 액션
    fetchCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    fetchCartCount,
    
    // 계산된 값
    getTotalAmount,
    
    // 유틸리티
    setError: (error) => setError(error)
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};