import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'

const PrivateRoute = ({ children }) => {
  const { token } = useAuth()
  
  if (!token) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

export default PrivateRoute