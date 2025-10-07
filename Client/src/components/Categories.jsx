import React, { memo } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import './Categories.css';

const Categories = memo(() => {
  const { isDarkMode, colors } = useTheme();

  const categoriesStyle = {
    backgroundColor: colors.background,
    padding: '0 0 4rem 0',
    textAlign: 'center',
    transition: 'background-color 0.3s ease'
  };

  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1rem'
  };



  const categoryItemStyle = {
    backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
    color: isDarkMode ? '#ffffff' : '#000000',
    padding: '1.5rem 1rem',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    border: isDarkMode ? '2px solid #333333' : '2px solid #f0f0f0',
    boxShadow: isDarkMode 
      ? '0 4px 16px rgba(0, 0, 0, 0.3)' 
      : '0 4px 16px rgba(0, 0, 0, 0.1)',
    position: 'relative',
    overflow: 'hidden',
    height: '120px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  };

  const categoryTitleStyle = {
    fontSize: '1rem',
    fontWeight: '600',
    color: isDarkMode ? '#ffffff' : '#000000',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    margin: 0,
    transition: 'color 0.3s ease',
    textAlign: 'center',
    lineHeight: '1.2'
  };

  const categories = [
    { 
      name: 'KEYWORD RESEARCH', 
      id: 'keyword', 
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" 
                stroke={isDarkMode ? '#ffffff' : '#333333'} 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"/>
        </svg>
      )
    },
    { 
      name: 'VISUAL CONTENT', 
      id: 'image-video', 
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M23 7L16 12L23 17V7Z" 
                fill={isDarkMode ? '#ffffff' : '#333333'}/>
          <rect x="1" y="5" width="14" height="14" rx="2" 
                stroke={isDarkMode ? '#ffffff' : '#333333'} 
                strokeWidth="2"/>
        </svg>
      )
    },
    { 
      name: 'ANALYTICS', 
      id: 'blog-insights', 
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 20V10M12 20V4M6 20V14" 
                stroke={isDarkMode ? '#ffffff' : '#333333'} 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"/>
        </svg>
      )
    },
    { 
      name: 'CONTENT STRATEGY', 
      id: 'youtube-creator', 
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L3 7L12 12L21 7L12 2Z" 
                stroke={isDarkMode ? '#ffffff' : '#333333'} 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"/>
          <path d="M3 17L12 22L21 17M3 12L12 17L21 12" 
                stroke={isDarkMode ? '#ffffff' : '#333333'} 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"/>
        </svg>
      )
    }
  ];

  const handleCategoryHover = (e, isHover) => {
    const card = e.currentTarget;
    if (isHover) {
      card.style.transform = 'translateY(-8px) scale(1.02)';
      card.style.boxShadow = isDarkMode 
        ? '0 20px 40px rgba(0, 0, 0, 0.5)' 
        : '0 20px 40px rgba(0, 0, 0, 0.15)';
      card.style.backgroundColor = isDarkMode ? '#2a2a2a' : '#f8f9fa';
    } else {
      card.style.transform = 'translateY(0) scale(1)';
      card.style.boxShadow = isDarkMode 
        ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
        : '0 8px 32px rgba(0, 0, 0, 0.1)';
      card.style.backgroundColor = isDarkMode ? '#1a1a1a' : '#ffffff';
    }
  };

  const iconStyle = {
    marginBottom: '0.8rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  };

  return (
    <section style={categoriesStyle}>
      <div style={containerStyle}>
        <h2 style={{
          fontSize: '3.5rem',
          fontWeight: '300',
          fontFamily: "'Dancing Script', 'Brush Script MT', cursive",
          color: colors.text.primary,
          marginBottom: '1rem',
          textAlign: 'center',
          letterSpacing: '2px',
          background: isDarkMode 
            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          textShadow: isDarkMode ? '2px 2px 4px rgba(0,0,0,0.3)' : '1px 1px 2px rgba(0,0,0,0.1)',
          marginTop: '2rem'
        }}>
          Explore Categories
        </h2>
        <p style={{
          fontSize: '1.2rem',
          color: colors.text.secondary,
          textAlign: 'center',
          marginBottom: '3rem',
          maxWidth: '700px',
          margin: '0 auto 3rem auto',
          fontWeight: '300',
          lineHeight: '1.6',
          letterSpacing: '0.5px',
          fontStyle: 'italic'
        }}>
          Discover powerful tools and insights for content creators and digital marketers
        </p>
        <div className="categories-grid">
          {categories.map((category) => (
            <div
              key={category.id}
              style={categoryItemStyle}
              onMouseEnter={(e) => handleCategoryHover(e, true)}
              onMouseLeave={(e) => handleCategoryHover(e, false)}
            >
              <div style={iconStyle}>{category.icon}</div>
              <h3 style={categoryTitleStyle}>{category.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

Categories.displayName = 'Categories';

export default Categories;