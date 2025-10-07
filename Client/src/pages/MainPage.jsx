import React, { memo, useCallback, useMemo, useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { productAPI } from '../services/api';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import Categories from '../components/Categories';
import TrendingNow from '../components/TrendingNow';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';

const MainPage = memo(() => {
  const { user, logout, isLoading } = useAuth();
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  
  // 배경 이미지 배열 - 비즈니스 인사이트 & 크리에이터 포럼 테마
  const [backgroundImages, setBackgroundImages] = useState([
    '/무난.webp',
    '/석양.webp', 
    '/형광.webp',
    '/환상.webp'
  ]);

  const isAdminUser = useMemo(() => {
    // user.role 또는 user.user_type이 'admin'인지 확인
    return user?.role === 'admin' || user?.user_type === 'admin';
  }, [user]);

  const handleLogout = useCallback(() => {
    try {
      // AuthContext의 logout 함수 호출
      logout();
      
      // 페이지 새로고침으로 완전한 상태 초기화
      window.location.href = '/';
    } catch (error) {
      console.error('로그아웃 중 오류:', error);
      // 오류 발생 시에도 강제로 메인페이지로 이동
      window.location.href = '/';
    }
  }, [logout]);

  // 상품 데이터 가져오기
  const fetchProducts = useCallback(async () => {
    try {
      setProductsLoading(true);
      const response = await productAPI.getAllProducts({
        limit: 100, // 전체 상품을 가져오기 위해 큰 수로 설정
        isActive: true
      });
      
      if (response.data.success) {
        setProducts(response.data.data.products || []);
      }
    } catch (error) {
      console.error('상품 데이터 로딩 오류:', error);
    } finally {
      setProductsLoading(false);
    }
  }, []);

  // 컴포넌트 마운트 시 상품 데이터 로드
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const mainStyle = useMemo(() => ({
    minHeight: '100vh',
    backgroundColor: '#fff',
    display: 'flex',
    flexDirection: 'column'
  }), []);

  const contentStyle = useMemo(() => ({
    flex: 1
  }), []);

  if (isLoading) {
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

  return (
    <div style={mainStyle}>
      <Navbar 
        user={user} 
        isAdmin={isAdminUser} 
        onLogout={handleLogout} 
      />
      <main style={contentStyle}>
        <HeroSection backgroundImages={backgroundImages} />
        <Categories />
        <TrendingNow />
        
        {/* 상품 목록 섹션 */}
        <section style={{
          padding: '60px 20px',
          backgroundColor: '#f8f9fa'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            <div style={{
              textAlign: 'center',
              marginBottom: '40px'
            }}>
              <h2 style={{
                fontSize: '32px',
                fontWeight: '700',
                color: '#333',
                marginBottom: '12px'
              }}>
                전체 상품
              </h2>
              <p style={{
                fontSize: '16px',
                color: '#666',
                lineHeight: '1.6'
              }}>
                다양한 카테고리의 상품들을 만나보세요
              </p>
            </div>
            
            {productsLoading ? (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '200px'
              }}>
                <div style={{
                  fontSize: '16px',
                  color: '#666'
                }}>
                  상품을 불러오는 중...
                </div>
              </div>
            ) : products.length > 0 ? (
              <div style={{
                 display: 'grid',
                 gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                 gap: '24px',
                 padding: '0'
               }}>
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: '#666'
              }}>
                <p style={{ fontSize: '18px' }}>등록된 상품이 없습니다.</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
});

MainPage.displayName = 'MainPage';

export default MainPage;