import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import { Home } from './pages/Home'
import { Dashboard } from './pages/Dashboard'
import { Template } from './pages/Template'
import { Emails } from './pages/Emails'
import { Credentials } from './pages/Credentials'
import { EmailDetails } from './pages/EmailDetails'
import { SendEmail } from './pages/SendEmail'


function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="templates" element={<Template />} />
            <Route path="emails" element={<Emails />} />
            <Route path="emails/:id" element={<EmailDetails />} />
            <Route path="send-email" element={<SendEmail />} />

            <Route path="settings" element={<Credentials />} />
          </Route>

          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
