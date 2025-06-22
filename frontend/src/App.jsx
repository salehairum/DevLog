import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'

function App() {
  const [user, setUser] = useState(null)
  return (
    <>
      {user ? (
        <Dashboard user={user} />
      ) : (
        <Login onLogin={setUser} />
      )}
    </>
  )
}

export default App
