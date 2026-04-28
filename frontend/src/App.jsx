import { Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from './components/auth/Login/LoginPage'
import PrivateRoute from './components/auth/PrivateRoute'
import ProtectedRoute from './components/auth/ProtectedRoute'
import ErrorBoundary from './components/common/ErrorBoundary'
import { SidebarProvider } from './contexts/SidebarContext'
import MainLayout from './components/layout/MainLayout'
import RegisterPage from './pages/Register/RegisterPage'
import LandingPage from './pages/Landing/LandingPage'
import ProfilePage from './pages/Profile/ProfilePage'
import AdminDashboardPage from './pages/AdminDashboard/AdminDashboardPage'
import AdminTicketsPage from './pages/AdminTickets/AdminTicketsPage'
import TechnicianDashboardPage from './pages/TechnicianDashboard/TechnicianDashboardPage'
import UnauthorizedPage from './pages/Unauthorized/UnauthorizedPage'
import SuspendedPage from './pages/Suspended/SuspendedPage'
import UserDashboardPage from './pages/UserDashboard/UserDashboardPage'
import UserManagementPage from './pages/UserManagement/UserManagementPage'
import CataloguePage from './pages/Catalogue/CataloguePage'
import TicketsPage from './pages/Tickets/TicketsPage'
import TicketDetailPage from './pages/TicketDetail/TicketDetailPage'
import BookingsPage from './pages/Bookings/BookingsPage'
import CreateBookingPage from './pages/Bookings/CreateBookingPage'
import AdminBookingReviewPage from './pages/Bookings/AdminBookingReviewPage'
import NotificationsPage from './pages/Notifications/NotificationsPage'
import ResourcesPage from './pages/Resources/ResourcesPage'

function App() {
  return (
    <ErrorBoundary>
      <SidebarProvider>
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
              {(() => {
                const role = (localStorage.getItem('authRole') || localStorage.getItem('role') || '').toUpperCase()
                if (role === 'ADMIN') {
                  return <Navigate to="/admin-dashboard" replace />
                } else if (role === 'TECHNICIAN' || role === 'MANAGER') {
                  return <Navigate to="/technician-dashboard" replace />
                } else {
                  return <MainLayout pageClass="ud-page"><UserDashboardPage /></MainLayout>
                }
              })()}
            </PrivateRoute>
          }
        />
        <Route
          path="/user-dashboard"
          element={
            <PrivateRoute fallback={<Navigate to="/login" replace />}>
              <MainLayout pageClass="ud-page">
                <UserDashboardPage />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute fallback={<Navigate to="/login" replace />}>
              <MainLayout pageClass="profile-page">
                <ProfilePage />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <MainLayout pageClass="admin-dashboard-page">
                <AdminDashboardPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-tickets"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <MainLayout pageClass="admin-tickets-layout">
                <AdminTicketsPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/technician-dashboard"
          element={
            <ProtectedRoute requiredRoles={['TECHNICIAN', 'MANAGER']}>
              <MainLayout pageClass="technician-layout">
                <TechnicianDashboardPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route path="/admindashboard" element={<Navigate to="/admin-dashboard" replace />} />
        <Route
          path="/admin/user-management"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <MainLayout pageClass="um-page">
                <UserManagementPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/catalogue"
          element={
            <PrivateRoute fallback={<Navigate to="/login" replace />}>
              <MainLayout pageClass="catalogue-layout">
                <CataloguePage />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/tickets"
          element={
            <PrivateRoute fallback={<Navigate to="/login" replace />}>
              <MainLayout pageClass="tickets-layout">
                <TicketsPage />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/ticket-detail/:ticketId"
          element={
            <PrivateRoute fallback={<Navigate to="/login" replace />}>
              <MainLayout pageClass="ticket-detail-layout">
                <TicketDetailPage />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/bookings"
          element={
            <PrivateRoute fallback={<Navigate to="/login" replace />}>
              {(() => {
                const role = (localStorage.getItem('authRole') || localStorage.getItem('role') || '').toUpperCase()
                if (role === 'ADMIN') {
                  return <MainLayout pageClass="admin-review-layout"><AdminBookingReviewPage /></MainLayout>
                }
                return <MainLayout pageClass="bookings-layout"><BookingsPage /></MainLayout>
              })()}
            </PrivateRoute>
          }
        />
        <Route
          path="/bookings/create"
          element={
            <PrivateRoute fallback={<Navigate to="/login" replace />}>
              <MainLayout pageClass="create-booking-layout">
                <CreateBookingPage />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <PrivateRoute fallback={<Navigate to="/login" replace />}>
              <MainLayout pageClass="notif-layout">
                <NotificationsPage />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/resources"
          element={
            <PrivateRoute fallback={<Navigate to="/login" replace />}>
              <MainLayout pageClass="resources-layout">
                <ResourcesPage />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </SidebarProvider>
    </ErrorBoundary>
  )
}

export default App
