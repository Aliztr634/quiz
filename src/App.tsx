import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'
import InstructorDashboard from './pages/InstructorDashboard'
import StudentDashboard from './pages/StudentDashboard'
import Exam from './pages/Exam'
import LoadingSpinner from './components/LoadingSpinner'

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  components: {
    MuiModal: {
      defaultProps: {
        disablePortal: true,
      },
    },
    MuiDialog: {
      defaultProps: {
        disablePortal: true,
      },
    },
  },
})

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
      <Route path="/exam/:examId" element={user ? <Exam /> : <Navigate to="/login" replace />} />
      <Route path="/" element={
        !user ? <Navigate to="/login" replace /> : (
          user.role === 'admin' ? <AdminDashboard /> :
          user.role === 'instructor' ? <InstructorDashboard /> :
          user.role === 'student' ? <StudentDashboard /> :
          <Navigate to="/login" replace />
        )
      } />
    </Routes>
  )
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
