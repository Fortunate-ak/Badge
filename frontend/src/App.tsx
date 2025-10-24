import './App.css'
import { Route, Routes } from 'react-router'
import AuthRoutes from './pages/auth'

function App() {

  return (
    <>
      <Routes>
        {AuthRoutes()}
      </Routes>
    </>
  )
}

export default App
