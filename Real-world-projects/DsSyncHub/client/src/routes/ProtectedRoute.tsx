import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import PageLoader from '../components/common/PageLoader'
import { useAppSelector } from '../hooks/redux'

type ProtectedRouteProps = {
  children: ReactNode
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const location = useLocation()
  const { isAuthenticated, initialized } = useAppSelector((state) => state.auth)

  if (!initialized) {
    return <PageLoader label="Restoring your workspace session..." />
  }

  if (!isAuthenticated) {
    return <Navigate replace state={{ from: location }} to="/login" />
  }

  return children
}

export default ProtectedRoute
