import React, { useState, useEffect, memo } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const SlideBackground = memo(({ 
  images = [], 
  interval = 5000, 
  children,
  height = '100vh',
  overlay = true,
  overlayOpacity = 0.4 
}) => {
  const { isDarkMode, colors } = useTheme();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (images.length === 0) return;

    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % images.length
      );
    }, interval);

    return () => clearInterval(timer);
  }, [images.length, interval]);

  const containerStyle = {
    position: 'relative',
    width: '100%',
    height: height,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const imageStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'opacity 1s ease-in-out',
    zIndex: 1
  };

  const overlayStyle = overlay ? {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: isDarkMode 
      ? `rgba(0, 0, 0, ${overlayOpacity + 0.2})` 
      : `rgba(0, 0, 0, ${overlayOpacity})`,
    zIndex: 2
  } : {};

  const contentStyle = {
    position: 'relative',
    zIndex: 3,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  // 이미지가 없을 때 기본 배경 (테마에 맞게 조정)
  const defaultBackgroundStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: isDarkMode 
      ? 'linear-gradient(135deg, #2d2d2d 0%, #1e1e1e 100%)'
      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    zIndex: 1
  };

  return (
    <div style={containerStyle}>
      {images.length > 0 ? (
        <>
          {images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Background ${index + 1}`}
              style={{
                ...imageStyle,
                opacity: index === currentImageIndex ? 1 : 0
              }}
            />
          ))}
          {overlay && <div style={overlayStyle} />}
        </>
      ) : (
        <div style={defaultBackgroundStyle} />
      )}
      
      <div style={contentStyle}>
        {children}
      </div>
    </div>
  );
});

SlideBackground.displayName = 'SlideBackground';

export default SlideBackground;