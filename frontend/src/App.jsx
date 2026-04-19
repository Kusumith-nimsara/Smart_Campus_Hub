import { Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from './components/auth/Login/LoginPage'
import PrivateRoute from './components/auth/PrivateRoute'
import ProtectedRoute from './components/auth/ProtectedRoute'
import ErrorBoundary from './components/common/ErrorBoundary'
import RegisterPage from './pages/Register/RegisterPage'
import LandingPage from './pages/Landing/LandingPage'
import ProfilePage from './pages/Profile/ProfilePage'
import AdminDashboardPage from './pages/AdminDashboard/AdminDashboardPage'
import UnauthorizedPage from './pages/Unauthorized/UnauthorizedPage'
import SuspendedPage from './pages/Suspended/SuspendedPage'
import UserDashboardPage from './pages/UserDashboard/UserDashboardPage'
import UserManagementPage from './pages/UserManagement/UserManagementPage'
import CataloguePage from './pages/Catalogue/CataloguePage'
import TicketsPage from './pages/Tickets/TicketsPage'
import TicketDetailPage from './pages/TicketDetail/TicketDetailPage'
import BookingsPage from './pages/Bookings/BookingsPage'
import NotificationsPage from './pages/Notifications/NotificationsPage'

function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/admin-login" element={<Navigate to="/login" replace />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/suspended" element={<SuspendedPage />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute fallback={<Navigate to="/login" replace />}>
              {(localStorage.getItem('authRole') || localStorage.getItem('role') || '').toUpperCase() === 'ADMIN' ? (
                <Navigate to="/admin-dashboard" replace />
              ) : (
                <UserDashboardPage />
              )}
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute fallback={<Navigate to="/login" replace />}>
              <ProfilePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="/admindashboard" element={<Navigate to="/admin-dashboard" replace />} />
        <Route
          path="/admin/user-management"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <UserManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/catalogue"
          element={
            <PrivateRoute fallback={<Navigate to="/login" replace />}>
              <CataloguePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/tickets"
          element={
            <PrivateRoute fallback={<Navigate to="/login" replace />}>
              <TicketsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/ticket-detail/:ticketId"
          element={
            <PrivateRoute fallback={<Navigate to="/login" replace />}>
              <TicketDetailPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/bookings"
          element={
            <PrivateRoute fallback={<Navigate to="/login" replace />}>
              <BookingsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <PrivateRoute fallback={<Navigate to="/login" replace />}>
              <NotificationsPage />
            </PrivateRoute>
          }
        />
        <Route path="/user-dashboard" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
  )
}

export default App
