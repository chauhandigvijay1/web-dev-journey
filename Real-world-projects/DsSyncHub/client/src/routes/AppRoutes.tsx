import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import PageLoader from '../components/common/PageLoader'
import DashboardLayout from '../layouts/DashboardLayout'
import PublicLayout from '../layouts/PublicLayout'
import GuestRoute from './GuestRoute'
import ProtectedRoute from './ProtectedRoute'

const HomePage = lazy(() => import('../pages/HomePage'))
const LoginPage = lazy(() => import('../pages/LoginPage'))
const SignupPage = lazy(() => import('../pages/SignupPage'))
const ForgotPasswordPage = lazy(() => import('../pages/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('../pages/ResetPasswordPage'))
const SharedNotePage = lazy(() => import('../pages/SharedNotePage'))
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'))
const DashboardPage = lazy(() => import('../pages/DashboardPage'))
const WorkspacesPage = lazy(() => import('../pages/dashboard/WorkspacesPage'))
const WorkspaceDetailsPage = lazy(() => import('../pages/dashboard/WorkspaceDetailsPage'))
const TasksPage = lazy(() => import('../pages/dashboard/TasksPage'))
const NotesPage = lazy(() => import('../pages/dashboard/NotesPage'))
const ChatPage = lazy(() => import('../pages/dashboard/ChatPage'))
const CalendarPage = lazy(() => import('../pages/dashboard/CalendarPage'))
const FilesPage = lazy(() => import('../pages/dashboard/FilesPage'))
const TeamPage = lazy(() => import('../pages/dashboard/TeamPage'))
const MeetingsPage = lazy(() => import('../pages/dashboard/MeetingsPage'))
const MeetingRoomPage = lazy(() => import('../pages/dashboard/MeetingRoomPage'))
const ActivityPage = lazy(() => import('../pages/dashboard/ActivityPage'))
const NotificationsPage = lazy(() => import('../pages/dashboard/NotificationsPage'))
const BillingPage = lazy(() => import('../pages/dashboard/BillingPage'))
const SettingsPage = lazy(() => import('../pages/dashboard/SettingsPage'))

const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader label="Loading page..." />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route
            path="/login"
            element={
              <GuestRoute>
                <LoginPage />
              </GuestRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <GuestRoute>
                <SignupPage />
              </GuestRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <GuestRoute>
                <ForgotPasswordPage />
              </GuestRoute>
            }
          />
          <Route
            path="/reset-password/:token"
            element={
              <GuestRoute>
                <ResetPasswordPage />
              </GuestRoute>
            }
          />
          <Route path="/notes/shared/:token" element={<SharedNotePage />} />
        </Route>

        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/workspaces" element={<WorkspacesPage />} />
          <Route path="/workspaces/:id" element={<WorkspaceDetailsPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/files" element={<FilesPage />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/meetings" element={<MeetingsPage />} />
          <Route path="/meetings/:roomId" element={<MeetingRoomPage />} />
          <Route path="/activity" element={<ActivityPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/billing" element={<BillingPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}

export default AppRoutes
