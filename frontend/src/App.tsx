import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>

          <Route path='/login' element={<Login />} />
          <Route path='/' element={<Signup />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
