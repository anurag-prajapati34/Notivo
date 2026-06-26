import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import { Home } from './pages/Home'
import { Dashboard } from './pages/Dashboard'
import { Template } from './pages/Template'
import { Emails } from './pages/Emails'
import { Credentials } from './pages/Credentials'


function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Home />} >
            <Route index path='emails' element={<Emails />} />
            <Route path='dashboard' element={<Dashboard />} />
            <Route path='template' element={<Template />} />
            <Route path='credentials' element={<Credentials />} />
          </Route>
          <Route path='/login' element={<Login />} />
          <Route path='/signup' element={<Signup />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
