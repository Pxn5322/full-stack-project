import { BrowserRouter, Link, Navigate, Outlet, Route, Routes, useNavigate } from 'react-router-dom';
import { BooksContext, BooksProvider } from './contexts/BooksProvider';
import BookingPage from './pages/BookingPage';
import LoginPage from './pages/LoginPage';
import { Button, Container, Navbar } from 'react-bootstrap';
import { signOut } from 'firebase/auth';
import { auth } from './firebase';
import './App.css';
import SignupPage from './pages/SignUpPage';
import { useContext } from 'react';
import AdminPage from './pages/AdminPage';
import NotFoundPage from './pages/NotFoundPage';

function Layout({ logout, currentUser }) {
  const navigate = useNavigate();

  return (
    <>
      <Navbar expand="lg" className="shadow-sm py-3">
        <Container>
          <Navbar.Brand as={Link} to="/" className="d-flex align-items-center gap-2 fw-bold text-secondary fs-4">
            <img
              src="https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?auto=format&fit=crop&w=128&h=128&q=80"
              alt="CareBook Logo"
              width="36"
              height="36"
              className="d-inline-block align-top rounded border border-primary border-2"
              style={{ objectFit: 'cover' }}
            />
            <span className="text-primary text-gradient">Care<span className="text-secondary">Book</span></span>
          </Navbar.Brand>

          <div className="d-flex align-items-center gap-3 ms-auto">
            {currentUser ? (
              <div className="d-flex align-items-center gap-3">
                <span className="small text-muted d-none d-sm-inline">
                  Signed in as: <strong className="text-secondary">{currentUser.email}</strong>
                </span>
                <Button variant="outline-danger" size="sm" className="fw-semibold" onClick={logout}>
                  <i className="bi bi-box-arrow-right me-1"></i> Logout
                </Button>
              </div>
            ) : (
              <Button variant="outline-primary" size="sm" className="fw-semibold" onClick={() => navigate('/login')}>
                Sign In
              </Button>
            )}
          </div>
        </Container>
      </Navbar>

      <Outlet />
    </>
  );
}

function ProtectedRoute({ children, adminOnly = false }) {
  const { currentUser } = useContext(BooksContext);

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const isAdmin = currentUser.email === "admin@carebook.com";

  if (adminOnly && !isAdmin) {
    return <Navigate to="/bookings" replace />;
  }

  if (!adminOnly && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}

function AppRoutes() {
  const { currentUser } = useContext(BooksContext);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout Error: ", error);
    }
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route path="/" element={<Layout logout={handleLogout} currentUser={currentUser} />}>
          <Route path="bookings" element={
            <ProtectedRoute>
              <BookingPage />
            </ProtectedRoute>
          } />

          <Route path="admin" element={
            <ProtectedRoute adminOnly>
              <AdminPage />
            </ProtectedRoute>
          } />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <BooksProvider>
      <AppRoutes />
    </BooksProvider>
  );
}