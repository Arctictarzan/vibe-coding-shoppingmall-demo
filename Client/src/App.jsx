import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import MainPage from "./pages/MainPage";
import SignupPage from "./pages/SignupPage";
import Register from "./pages/Register";
import LoginPage from "./pages/LoginPage";
import AdminPage from "./pages/admin/AdminPage";
import ProductCreatePage from "./pages/admin/ProductCreatePage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import OrderFailurePage from "./pages/OrderFailurePage";
import OrderListPage from "./pages/OrderListPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import DebugAuth from "./components/DebugAuth";
import "./App.css";

const AppContent = () => {
  const { colors } = useTheme();

  useEffect(() => {
    // body 스타일 적용
    document.body.style.backgroundColor = colors.background;
    document.body.style.color = colors.text.primary;
  }, [colors]);

  return (
    <div className="App" style={{ backgroundColor: colors.background, color: colors.text.primary }}>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/products/create" element={<ProductCreatePage />} />
        <Route path="/admin/products/edit/:id" element={<ProductCreatePage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-success" element={<OrderSuccessPage />} />
        <Route path="/order-failure" element={<OrderFailurePage />} />
        <Route path="/orders" element={<OrderListPage />} />
        <Route path="/orders/:orderId" element={<OrderDetailPage />} />
        <Route path="/debug-auth" element={<DebugAuth />} />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <AppContent />
          </Router>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;