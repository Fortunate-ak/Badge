import './App.css'
import { Route, Routes, useNavigate } from 'react-router'
import AuthRoutes from './pages/auth'
import React from 'react'
import { GetCurrentUser } from './utils/auth'
import type { User } from './types'

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
  const navigate = useNavigate()
  React.useEffect(() => {
    GetCurrentUser().then(user => {
      setCurrentUser(user);
      console.log(user)
    });
  }, []);
  return <main className='w-full h-full flex flex-row justify-center items-center bg-secondary'>
    <div className="p-6 bg-background rounded-md flex flex-col gap-0">
      <span className="text-subtle-text text-xs">
        {currentUser ? `Welcome` : "Not logged in"}
      </span>
      <h1 className='font-bold text-lg'>{(currentUser as User)?.first_name} {(currentUser as User)?.last_name}</h1>
      <p className='text-sm text-subtle-text'>
        {currentUser?.bio}
      </p>
      {
        currentUser ? <button onClick={() => navigate("/auth/")} className="tw-button">Logout</button> : <button className="tw-button" onClick={() => navigate("/auth/")}>Login</button>
      }
    </div>

  </main>
}

export default App
