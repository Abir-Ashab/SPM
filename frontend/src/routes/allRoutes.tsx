import { Route, Routes } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import FrontPage from '../components/globalFiles/frontPage';
import RegisterPage from '../components/auth/registerPage';
import LoginPage from '../components/auth/loginPage';
import EditProfile from '../components/profile/editProfile';
import ProtectedRoute from '../components/auth/protectedRoute';
import Dashboard from '../components/dashboard/Dashboard';
import ChatPage from '../components/chat/ChatPage';
import ProductsPage from '../components/products/ProductsPage';
import OrdersPage from '../components/orders/OrdersPage';
import { Navigate } from 'react-router-dom';
const HomeRoute = () => {
  const token = localStorage.getItem('token');
  
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <FrontPage />;
};

export default function AllRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomeRoute />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />

      <Route element={<Layout />}>
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard/>
            </ProtectedRoute>
          }
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <EditProfile/>
            </ProtectedRoute>
          }
        />
        <Route 
          path="/chat" 
          element={
            <ProtectedRoute>
              <ChatPage/>
            </ProtectedRoute>
          }
        />
        <Route 
          path="/products" 
          element={
            <ProtectedRoute>
              <ProductsPage/>
            </ProtectedRoute>
          }
        />
        <Route 
          path="/orders" 
          element={
            <ProtectedRoute>
              <OrdersPage/>
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}