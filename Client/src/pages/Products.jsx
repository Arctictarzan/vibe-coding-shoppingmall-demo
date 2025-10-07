import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { productAPI } from '../services/api';
import { useCart } from '../contexts/CartContext';

const ProductsContainer = styled.div`
  padding: 2rem 0;
`;

const PageTitle = styled.h1`
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
`;

const FilterSection = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  align-items: center;
`;

const SearchInput = styled.input`
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  min-width: 200px;
`;

const FilterSelect = styled.select`
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
`;

const ProductCard = styled.div`
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const ProductImage = styled.div`
  height: 200px;
  background: linear-gradient(45deg, #f0f0f0, #e0e0e0);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  color: #999;
`;

const ProductInfo = styled.div`
  padding: 1.5rem;
`;

const ProductName = styled.h3`
  margin-bottom: 0.5rem;
  color: #333;
  font-size: 1.1rem;
`;

const ProductDescription = styled.p`
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  line-height: 1.4;
`;

const ProductPrice = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
  color: #007bff;
  margin-bottom: 1rem;
`;

const AddToCartButton = styled.button`
  width: 100%;
  background-color: #007bff;
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  &:hover:not(:disabled) {
    background-color: #0056b3;
  }

  &:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 2rem;
  font-size: 1.1rem;
  color: #666;
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 2rem;
  font-size: 1.1rem;
  color: #dc3545;
  background-color: #f8d7da;
  border-radius: 5px;
  margin: 1rem 0;
`;

const NoProductsMessage = styled.div`
  text-align: center;
  padding: 3rem;
  font-size: 1.1rem;
  color: #666;
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin: 2rem 0;
`;

const PaginationButton = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'active',
})`
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background-color: ${props => props.active ? '#007bff' : 'white'};
  color: ${props => props.active ? 'white' : '#333'};
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background-color: ${props => props.active ? '#0056b3' : '#f8f9fa'};
  }

  &:disabled {
    background-color: #f8f9fa;
    color: #6c757d;
    cursor: not-allowed;
  }
`;

const PaginationInfo = styled.div`
  color: #666;
  font-size: 0.9rem;
`;

const Products = () => {
  const { addToCart, cartLoading } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  
  // 페이지네이션 상태 추가
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(5); // 서버에서 설정한 limit과 동일

  useEffect(() => {
    fetchProducts();
  }, [currentPage]); // currentPage가 변경될 때마다 데이터 재요청

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('상품 데이터 요청 시작... 페이지:', currentPage);
      
      // 페이지 파라미터를 포함하여 API 호출
      const response = await productAPI.getAllProducts({
        page: currentPage,
        limit: itemsPerPage
      });
      
      console.log('서버 응답:', response.data);
      
      // 서버 응답 구조에 맞게 데이터 접근
      if (response.data.success) {
        const data = response.data.data;
        const products = data?.products || [];
        const pagination = data?.pagination || {};
        
        console.log('상품 데이터:', products);
        console.log('페이지네이션 정보:', pagination);
        
        setProducts(products);
        setCurrentPage(pagination.currentPage || 1);
        setTotalPages(pagination.totalPages || 1);
        setTotalItems(pagination.totalItems || 0);
      } else {
        setError('상품 데이터를 불러올 수 없습니다.');
      }
    } catch (err) {
      setError('상품을 불러오는데 실패했습니다.');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
    try {
      // 로그인 확인
      const token = localStorage.getItem('token');
      if (!token) {
        alert('로그인이 필요합니다.');
        return;
      }

      // 기본 옵션으로 장바구니에 추가 (Products 페이지에서는 상세 옵션 선택 불가)
      const result = await addToCart(product.id, {
        quantity: 1,
        color: product.colors && product.colors.length > 0 ? product.colors[0] : '기본',
        size: product.sizes && product.sizes.length > 0 ? product.sizes[0] : '기본'
      });

      if (result.success) {
        alert(`${product.name}이(가) 장바구니에 추가되었습니다!`);
      } else {
        alert(result.message || '장바구니 추가에 실패했습니다.');
      }
    } catch (error) {
      console.error('장바구니 추가 실패:', error);
      alert('장바구니 추가에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 페이지 변경 핸들러
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // 검색과 정렬은 클라이언트 사이드에서 처리 (현재 페이지의 데이터만)
  const filteredAndSortedProducts = products
    .filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

  if (loading) {
    return (
      <ProductsContainer>
        <LoadingMessage>상품을 불러오는 중...</LoadingMessage>
      </ProductsContainer>
    );
  }

  if (error) {
    return (
      <ProductsContainer>
        <ErrorMessage>{error}</ErrorMessage>
      </ProductsContainer>
    );
  }

  return (
    <ProductsContainer>
      <PageTitle>전체 상품</PageTitle>
      
      <FilterSection>
        <SearchInput
          type="text"
          placeholder="상품 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <FilterSelect
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="name">이름순</option>
          <option value="price-low">가격 낮은순</option>
          <option value="price-high">가격 높은순</option>
        </FilterSelect>
      </FilterSection>

      {filteredAndSortedProducts.length === 0 ? (
        <NoProductsMessage>
          {searchTerm ? '검색 결과가 없습니다.' : '등록된 상품이 없습니다.'}
        </NoProductsMessage>
      ) : (
        <ProductsGrid>
          {filteredAndSortedProducts.map((product) => (
            <ProductCard key={product._id}>
              <ProductImage>
                {product.image?.url ? (
                  <img 
                    src={product.image.url} 
                    alt={product.image.alt || product.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  '📦'
                )}
              </ProductImage>
              <ProductInfo>
                <ProductName>{product.name}</ProductName>
                <ProductDescription>
                  {product.description.length > 100 
                    ? `${product.description.substring(0, 100)}...` 
                    : product.description
                  }
                </ProductDescription>
                <ProductPrice>
                  {product.price.toLocaleString()}원
                </ProductPrice>
                <AddToCartButton 
                  onClick={() => handleAddToCart(product)}
                  disabled={cartLoading}
                >
                  {cartLoading ? (
                    <>
                      <span className="spinner">⟳</span> 추가 중...
                    </>
                  ) : (
                    '장바구니에 추가'
                  )}
                </AddToCartButton>
              </ProductInfo>
            </ProductCard>
          ))}
        </ProductsGrid>
      )}

      {/* 페이지네이션 UI */}
      {totalPages > 1 && (
        <PaginationContainer>
          <PaginationButton
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            이전
          </PaginationButton>

          {/* 페이지 번호 버튼들 */}
          {Array.from({ length: totalPages }, (_, index) => {
            const pageNumber = index + 1;
            const isCurrentPage = pageNumber === currentPage;
            
            // 현재 페이지 주변의 페이지만 표시 (최대 5개)
            const shouldShow = 
              pageNumber === 1 || 
              pageNumber === totalPages || 
              Math.abs(pageNumber - currentPage) <= 2;

            if (!shouldShow) {
              // 생략 표시
              if (pageNumber === currentPage - 3 || pageNumber === currentPage + 3) {
                return <span key={pageNumber}>...</span>;
              }
              return null;
            }

            return (
              <PaginationButton
                key={pageNumber}
                active={isCurrentPage}
                onClick={() => handlePageChange(pageNumber)}
              >
                {pageNumber}
              </PaginationButton>
            );
          })}

          <PaginationButton
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            다음
          </PaginationButton>
        </PaginationContainer>
      )}

      {/* 페이지네이션 정보 */}
      <PaginationInfo>
        총 {totalItems}개 상품 중 {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalItems)}번째 표시 (페이지 {currentPage}/{totalPages})
      </PaginationInfo>
    </ProductsContainer>
  );
};

export default Products;