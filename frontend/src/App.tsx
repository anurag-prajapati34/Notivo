import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { useAuthContext } from './hooks'
import { Dashboard } from './pages/Dashboard'
import { EmailDetails } from './pages/EmailDetails'
import { Emails } from './pages/Emails'
import { Home } from './pages/Home'
import { Landing } from './pages/LandingPage'
import Login from './pages/Login'
import { SendEmail } from './pages/SendEmail'
import { SendGridCredentials } from './pages/SendGridCredentials'
import Signup from './pages/Signup'
import { Template } from './pages/Template'

// A small wrapper to guard protected dashboard pages
const ProtectedLayout = () => {
  const { isLoggedIn } = useAuthContext();

  // If not logged in, boot them to the login page immediately
  if (!isLoggedIn) {
    return <Navigate to="/intro" replace />;
  }

  // If logged in, render the dashboard structure (Home component)
  return <Home />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/intro" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Dashboard Routes */}
        <Route path="/" element={<ProtectedLayout />}>
          <Route index element={<Dashboard />} />
          {/* <Route path="dashboard" element={<Dashboard />} /> */}
          <Route path="templates" element={<Template />} />
          <Route path="emails" element={<Emails />} />
          <Route path="emails/:id" element={<EmailDetails />} />
          <Route path="send-email" element={<SendEmail />} />
          <Route path="settings" element={<SendGridCredentials />} />
        </Route>

        {/* Fallback Catch-All */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App