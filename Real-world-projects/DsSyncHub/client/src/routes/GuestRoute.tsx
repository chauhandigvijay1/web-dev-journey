import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import PageLoader from '../components/common/PageLoader'
import { useAppSelector } from '../hooks/redux'

type GuestRouteProps = {
  children: ReactNode
}

const GuestRoute = ({ children }: GuestRouteProps) => {
  const location = useLocation()
  const { isAuthenticated, initialized } = useAppSelector((state) => state.auth)

  if (!initialized) {
    return <PageLoader label="Checking your session..." />
  }

  if (isAuthenticated) {
    const nextPath =
      (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || '/dashboard'
    return <Navigate replace to={nextPath} />
  }

  return children
}

export default GuestRoute
