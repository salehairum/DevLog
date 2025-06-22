import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'

function App() {
  const [user, setUser] = useState(null)
  const handleLogout = () => {
    setUser(null)
  }
  return (
    <>
      {user ? (
        <Dashboard user={user} onLogout={handleLogout} />
      ) : (
        <Login onLogin={setUser} />
      )}
    </>
  )
}

export default App
