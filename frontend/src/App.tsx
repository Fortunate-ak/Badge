import './App.css'
import { Route, Routes } from 'react-router'
import AuthRoutes from './pages/auth'
import React from 'react'
import { GetCurrentUser } from './utils/auth'

function App() {

  return (
    <>
      <Routes>
        {AuthRoutes()}
        <Route path="/" element={<Home />} />
      </Routes>
    </>
  )
}


function Home() {
  const [currentUser, setCurrentUser] = React.useState<any>(null);
  React.useEffect(() => {
    GetCurrentUser().then(user => {
      setCurrentUser(user);
    });
  }, []);
  return <div>
    {currentUser ? `Logged in as ${currentUser.email}` : "Not logged in"}
  </div>
}

export default App
