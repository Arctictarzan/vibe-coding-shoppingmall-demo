import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const HeaderContainer = styled.header`
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled(Link)`
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  text-decoration: none;
  
  &:hover {
    color: #007bff;
  }
`;

const Nav = styled.nav`
  display: flex;
  gap: 2rem;
`;

const NavLink = styled(Link)`
  color: #333;
  text-decoration: none;
  font-weight: 500;
  
  &:hover {
    color: #007bff;
  }
`;

const UserActions = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const Button = styled.button`
  background: none;
  border: 1px solid #007bff;
  color: #007bff;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  text-decoration: none;
  
  &:hover {
    background-color: #007bff;
    color: white;
  }
`;

const Header = () => {
  return (
    <HeaderContainer>
      <HeaderContent>
        <Logo to="/">ShopMall</Logo>
        <Nav>
          <NavLink to="/">홈</NavLink>
          <NavLink to="/products">상품</NavLink>
          <NavLink to="/categories">카테고리</NavLink>
          <NavLink to="/about">소개</NavLink>
        </Nav>
        <UserActions>
          <NavLink to="/cart">장바구니</NavLink>
          <Button as={Link} to="/login">로그인</Button>
          <Button as={Link} to="/register">회원가입</Button>
        </UserActions>
      </HeaderContent>
    </HeaderContainer>
  );
};

export default Header;