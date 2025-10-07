import React from 'react';

const StarRating = ({ rating = 0, maxStars = 5, size = 20, showRating = true, reviewCount = 0 }) => {
  const stars = [];
  
  for (let i = 1; i <= maxStars; i++) {
    const isFilled = i <= rating;
    const isHalfFilled = i - 0.5 <= rating && i > rating;
    
    stars.push(
      <span
        key={i}
        style={{
          fontSize: `${size}px`,
          color: isFilled || isHalfFilled ? '#ffc107' : '#e4e5e9',
          marginRight: '2px'
        }}
      >
        {isFilled ? '★' : isHalfFilled ? '☆' : '☆'}
      </span>
    );
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {stars}
      </div>
      {showRating && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '14px',
          color: '#666'
        }}>
          <span style={{ fontWeight: '600' }}>{rating.toFixed(1)}</span>
          {reviewCount > 0 && (
            <span>({reviewCount.toLocaleString()}개 리뷰)</span>
          )}
        </div>
      )}
    </div>
  );
};

export default StarRating;