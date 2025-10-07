import React, { memo, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const Navbar = memo(({ user, onLogout, isAdmin, cartItemCount = 0 }) => {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme, colors } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const themeDropdownRef = useRef(null);

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleSignupClick = () => {
    navigate('/signup');
  };

  const handleAdminClick = () => {
    navigate('/admin');
  };

  const handleCartClick = () => {
    navigate('/cart');
  };

  const handleOrdersClick = () => {
    navigate('/orders');
    setIsDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleThemeDropdown = () => {
    setIsThemeDropdownOpen(!isThemeDropdownOpen);
  };

  const handleThemeSelect = (theme) => {
    if ((theme === 'dark' && !isDarkMode) || (theme === 'light' && isDarkMode)) {
      toggleTheme();
    }
    setIsThemeDropdownOpen(false);
  };

  const handleLogout = () => {
    onLogout();
    setIsDropdownOpen(false);
  };

  const handleAdminClickWithClose = () => {
    navigate('/admin');
    setIsDropdownOpen(false);
  };

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(event.target)) {
        setIsThemeDropdownOpen(false);
      }
    };

    if (isDropdownOpen || isThemeDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen, isThemeDropdownOpen]);

  const navbarStyle = {
    position: 'sticky',
    top: 0,
    backgroundColor: colors.navbar.background,
    borderBottom: `1px solid ${colors.border}`,
    zIndex: 1000,
    padding: '0.75rem 0',
    transition: 'background-color 0.3s ease, border-color 0.3s ease'
  };

  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

  const logoStyle = {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    color: colors.navbar.text,
    textDecoration: 'none',
    letterSpacing: '0.5px',
    transition: 'color 0.3s ease'
  };

  const menuStyle = {
    display: 'flex',
    listStyle: 'none',
    margin: 0,
    padding: 0,
    gap: '2.5rem'
  };

  const menuItemStyle = {
    color: colors.text.primary,
    textDecoration: 'none',
    fontWeight: '400',
    fontSize: '0.9rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    transition: 'color 0.3s ease'
  };

  const buttonGroupStyle = {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'center'
  };

  const buttonStyle = {
    padding: '0.4rem 1rem',
    border: 'none',
    borderRadius: '2px',
    cursor: 'pointer',
    fontWeight: '400',
    fontSize: '0.85rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    transition: 'all 0.3s ease'
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: colors.button.primary,
    color: 'white'
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: 'transparent',
    color: colors.text.primary,
    border: `1px solid ${colors.text.primary}`
  };

  const adminButtonStyle = {
    ...buttonStyle,
    backgroundColor: colors.button.secondary,
    color: 'white'
  };

  const welcomeStyle = {
    color: colors.text.primary,
    fontWeight: '400',
    fontSize: '0.9rem'
  };

  const cartButtonStyle = {
    position: 'relative',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'opacity 0.3s ease'
  };

  const cartIconStyle = {
    width: '24px',
    height: '24px',
    stroke: colors.text.primary,
    strokeWidth: '1.5',
    fill: 'none'
  };

  const cartCountStyle = {
    position: 'absolute',
    top: '-2px',
    right: '-2px',
    backgroundColor: colors.button.primary,
    color: 'white',
    borderRadius: '50%',
    width: '18px',
    height: '18px',
    fontSize: '0.7rem',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '18px'
  };

  const userDropdownStyle = {
    position: 'relative',
    display: 'inline-block'
  };

  const userButtonStyle = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: colors.text.primary,
    fontWeight: '400',
    fontSize: '0.9rem',
    padding: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    borderRadius: '4px',
    transition: 'background-color 0.3s ease'
  };

  const dropdownMenuStyle = {
    position: 'absolute',
    top: '100%',
    right: '0',
    backgroundColor: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: '4px',
    boxShadow: isDarkMode ? '0 4px 6px rgba(0, 0, 0, 0.3)' : '0 4px 6px rgba(0, 0, 0, 0.1)',
    minWidth: '160px',
    zIndex: 1001,
    padding: '0.5rem 0',
    marginTop: '0.25rem'
  };

  const dropdownItemStyle = {
    display: 'block',
    width: '100%',
    padding: '0.75rem 1rem',
    border: 'none',
    background: 'none',
    textAlign: 'left',
    cursor: 'pointer',
    fontSize: '0.85rem',
    color: colors.text.primary,
    transition: 'background-color 0.3s ease',
    textDecoration: 'none'
  };

  const arrowStyle = {
    fontSize: '0.7rem',
    transition: 'transform 0.3s ease',
    transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'
  };

  const themeDropdownStyle = {
    position: 'relative',
    display: 'inline-block'
  };

  const themeButtonStyle = {
    background: 'none',
    border: `1px solid ${colors.border}`,
    borderRadius: '4px',
    cursor: 'pointer',
    color: colors.text.primary,
    fontWeight: '400',
    fontSize: '0.85rem',
    padding: '0.5rem 0.75rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.3s ease',
    backgroundColor: colors.surface
  };

  const themeDropdownMenuStyle = {
    position: 'absolute',
    top: '100%',
    right: '0',
    backgroundColor: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: '4px',
    boxShadow: isDarkMode ? '0 4px 6px rgba(0, 0, 0, 0.3)' : '0 4px 6px rgba(0, 0, 0, 0.1)',
    minWidth: '120px',
    zIndex: 1001,
    padding: '0.5rem 0',
    marginTop: '0.25rem'
  };

  const themeDropdownItemStyle = {
    display: 'block',
    width: '100%',
    padding: '0.75rem 1rem',
    border: 'none',
    background: 'none',
    textAlign: 'left',
    cursor: 'pointer',
    fontSize: '0.85rem',
    color: colors.text.primary,
    transition: 'background-color 0.3s ease',
    textDecoration: 'none'
  };

  const themeArrowStyle = {
    fontSize: '0.7rem',
    transition: 'transform 0.3s ease',
    transform: isThemeDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'
  };

  return (
    <nav style={navbarStyle}>
      <div style={containerStyle}>
        <a href="/" style={logoStyle} className="brand-text">ARCTIC CREA</a>
        
        <ul style={menuStyle}>
          <li><a href="#" style={menuItemStyle}>AFFILIATE</a></li>
          <li><a href="#" style={menuItemStyle}>KEYWORD</a></li>
          <li><a href="#" style={menuItemStyle}>BLOG</a></li>
          <li><a href="#" style={menuItemStyle}>YOUTUBER</a></li>
        </ul>

        <div style={buttonGroupStyle}>
          {/* 테마 전환 드롭다운 */}
          <div style={themeDropdownStyle} ref={themeDropdownRef}>
            <button 
              style={themeButtonStyle}
              onClick={toggleThemeDropdown}
              onMouseOver={(e) => e.target.style.backgroundColor = colors.surface}
              onMouseOut={(e) => e.target.style.backgroundColor = colors.surface}
            >
              {isDarkMode ? '🌙' : '☀️'} {isDarkMode ? 'Dark' : 'Light'}
              <span style={themeArrowStyle}>▼</span>
            </button>
            
            {isThemeDropdownOpen && (
              <div style={themeDropdownMenuStyle}>
                <button 
                  style={{
                    ...themeDropdownItemStyle,
                    backgroundColor: !isDarkMode ? colors.surface : 'transparent'
                  }}
                  onClick={() => handleThemeSelect('light')}
                  onMouseOver={(e) => e.target.style.backgroundColor = colors.surface}
                  onMouseOut={(e) => e.target.style.backgroundColor = !isDarkMode ? colors.surface : 'transparent'}
                >
                  ☀️ Light Mode
                </button>
                <button 
                  style={{
                    ...themeDropdownItemStyle,
                    backgroundColor: isDarkMode ? colors.surface : 'transparent'
                  }}
                  onClick={() => handleThemeSelect('dark')}
                  onMouseOver={(e) => e.target.style.backgroundColor = colors.surface}
                  onMouseOut={(e) => e.target.style.backgroundColor = isDarkMode ? colors.surface : 'transparent'}
                >
                  🌙 Dark Mode
                </button>
              </div>
            )}
          </div>

          {/* 장바구니 아이콘 - 항상 표시 */}
          <button 
            style={cartButtonStyle}
            onClick={handleCartClick}
            onMouseOver={(e) => e.target.style.opacity = '0.7'}
            onMouseOut={(e) => e.target.style.opacity = '1'}
            title="장바구니"
          >
            <svg style={cartIconStyle} viewBox="0 0 24 24">
              <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H11a2 2 0 00-2 2v4.01" />
            </svg>
            {cartItemCount > 0 && (
              <span style={cartCountStyle}>
                {cartItemCount > 99 ? '99+' : cartItemCount}
              </span>
            )}
          </button>

          {/* 로그인 상태에 따른 조건부 렌더링 */}
          {user && user.name ? (
            /* 로그인된 상태: 드롭다운 메뉴로 사용자 옵션 표시 */
            <div style={userDropdownStyle} ref={dropdownRef}>
              <button 
                style={userButtonStyle}
                onClick={toggleDropdown}
                onMouseOver={(e) => e.target.style.backgroundColor = colors.surface}
                onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                안녕하세요 {user.name}님!
                <span style={arrowStyle}>▼</span>
              </button>
              
              {isDropdownOpen && (
                <div style={dropdownMenuStyle}>
                  <button 
                    style={dropdownItemStyle}
                    onClick={handleOrdersClick}
                    onMouseOver={(e) => e.target.style.backgroundColor = colors.surface}
                    onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    내 주문목록
                  </button>
                  {isAdmin && (
                    <button 
                      style={dropdownItemStyle}
                      onClick={handleAdminClickWithClose}
                      onMouseOver={(e) => e.target.style.backgroundColor = colors.surface}
                      onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      ADMIN
                    </button>
                  )}
                  <button 
                    style={dropdownItemStyle}
                    onClick={handleLogout}
                    onMouseOver={(e) => e.target.style.backgroundColor = colors.surface}
                    onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    LOGOUT
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* 로그인되지 않은 상태: 회원가입, 로그인 버튼만 표시 */
            <>
              <button 
                style={secondaryButtonStyle}
                onClick={handleSignupClick}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = colors.button.primary;
                  e.target.style.color = 'white';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = colors.text.primary;
                }}
              >
                Sign Up
              </button>
              <button 
                style={primaryButtonStyle}
                onClick={handleLoginClick}
                onMouseOver={(e) => e.target.style.backgroundColor = colors.button.primaryHover}
                onMouseOut={(e) => e.target.style.backgroundColor = colors.button.primary}
              >
                Login
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
});

Navbar.displayName = 'Navbar';

export default Navbar;