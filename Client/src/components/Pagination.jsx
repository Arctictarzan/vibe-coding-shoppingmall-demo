import React from 'react';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  totalItems, 
  itemsPerPage,
  onPageChange,
  showInfo = true,
  maxVisiblePages = 5 
}) => {
  // 페이지 번호 배열 생성
  const getPageNumbers = () => {
    const pages = [];
    const halfVisible = Math.floor(maxVisiblePages / 2);
    
    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // 끝 페이지가 조정되면 시작 페이지도 다시 조정
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalPages <= 1) {
    return null; // 페이지가 1개 이하면 페이지네이션 숨김
  }

  const buttonStyle = {
    padding: '8px 12px',
    margin: '0 2px',
    border: '1px solid #ddd',
    backgroundColor: '#fff',
    color: '#333',
    cursor: 'pointer',
    borderRadius: '4px',
    fontSize: '14px',
    transition: 'all 0.2s ease'
  };

  const activeButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#007bff',
    color: '#fff',
    borderColor: '#007bff'
  };

  const disabledButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#f8f9fa',
    color: '#6c757d',
    cursor: 'not-allowed',
    borderColor: '#dee2e6'
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '16px',
      padding: '20px 0'
    }}>
      {/* 페이지 정보 */}
      {showInfo && (
        <div style={{
          fontSize: '14px',
          color: '#666',
          textAlign: 'center'
        }}>
          총 {totalItems.toLocaleString()}개 중 {startItem.toLocaleString()}-{endItem.toLocaleString()}개 표시
        </div>
      )}

      {/* 페이지네이션 버튼들 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        {/* 첫 페이지 버튼 */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          style={currentPage === 1 ? disabledButtonStyle : buttonStyle}
          title="첫 페이지"
        >
          ≪
        </button>

        {/* 이전 페이지 버튼 */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={currentPage === 1 ? disabledButtonStyle : buttonStyle}
          title="이전 페이지"
        >
          ‹
        </button>

        {/* 시작 생략 표시 */}
        {pageNumbers[0] > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              style={buttonStyle}
            >
              1
            </button>
            {pageNumbers[0] > 2 && (
              <span style={{ padding: '8px 4px', color: '#666' }}>...</span>
            )}
          </>
        )}

        {/* 페이지 번호들 */}
        {pageNumbers.map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            style={page === currentPage ? activeButtonStyle : buttonStyle}
          >
            {page}
          </button>
        ))}

        {/* 끝 생략 표시 */}
        {pageNumbers[pageNumbers.length - 1] < totalPages && (
          <>
            {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
              <span style={{ padding: '8px 4px', color: '#666' }}>...</span>
            )}
            <button
              onClick={() => onPageChange(totalPages)}
              style={buttonStyle}
            >
              {totalPages}
            </button>
          </>
        )}

        {/* 다음 페이지 버튼 */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={currentPage === totalPages ? disabledButtonStyle : buttonStyle}
          title="다음 페이지"
        >
          ›
        </button>

        {/* 마지막 페이지 버튼 */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          style={currentPage === totalPages ? disabledButtonStyle : buttonStyle}
          title="마지막 페이지"
        >
          ≫
        </button>
      </div>
    </div>
  );
};

export default Pagination;