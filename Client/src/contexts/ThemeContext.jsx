import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // 로컬 스토리지에서 저장된 테마 설정 불러오기
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  // 테마 변경 함수
  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  // 테마 설정을 로컬 스토리지에 저장
  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // 테마 색상 정의
  const theme = {
    isDarkMode,
    toggleTheme,
    colors: {
      // 배경색
      background: isDarkMode ? '#121212' : '#ffffff',
      surface: isDarkMode ? '#1e1e1e' : '#f8f9fa',
      card: isDarkMode ? '#2d2d2d' : '#ffffff',
      
      // 텍스트 색상
      text: {
        primary: isDarkMode ? '#ffffff' : '#333333',
        secondary: isDarkMode ? '#b3b3b3' : '#666666',
        muted: isDarkMode ? '#888888' : '#999999'
      },
      
      // 테두리 색상
      border: isDarkMode ? '#404040' : '#e0e0e0',
      
      // 버튼 색상
      button: {
        primary: isDarkMode ? '#bb86fc' : '#6200ea',
        primaryHover: isDarkMode ? '#985eff' : '#3700b3',
        secondary: isDarkMode ? '#03dac6' : '#018786',
        secondaryHover: isDarkMode ? '#00bfa5' : '#00695c'
      },
      
      // 네비게이션 색상
      navbar: {
        background: isDarkMode ? '#1e1e1e' : '#ffffff',
        text: isDarkMode ? '#ffffff' : '#333333',
        border: isDarkMode ? '#404040' : '#e0e0e0'
      },
      
      // 입력 필드 색상
      input: {
        background: isDarkMode ? '#2d2d2d' : '#ffffff',
        border: isDarkMode ? '#404040' : '#ddd',
        text: isDarkMode ? '#ffffff' : '#333333',
        placeholder: isDarkMode ? '#888888' : '#999999'
      }
    }
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};