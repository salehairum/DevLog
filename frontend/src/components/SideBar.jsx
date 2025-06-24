import { signOut } from 'firebase/auth'
import { auth } from '../firebaseConfig'
import logo from '../logo.png'
import { useAuth } from '@/contexts/AuthContext'
import { StreakGrid } from './StreakGrid'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleUser } from '@fortawesome/free-solid-svg-icons'
import { useState } from 'react'

export function SideBar() {
    const { user, logout } = useAuth()

    const [imgError, setImgError] = useState(false)

    const handleLogout = async () => {
        try {
            await logout()  // This will call auth.signOut() and clear context
        } catch (err) {
            console.error("Error during sign out:", err)
        }
    }
    console.log("User in SideBar:", user)
    console.log(user.photoURL)

    return (
        <div className="flex flex-col h-screen w-60 bg-logs2 text-black p-4">

            {/* Top container: logo + user profile */}
            <div>
                <div className="flex justify-center mb-8">
                    <img src={logo} alt="Logo" className="w-32 h-auto" />
                </div>

                {user && (
                    <div className="flex items-center gap-3 bg-white rounded-xl shadow px-3 py-2 mb-6">
                        {user.photoURL && !imgError ? (
                            <img
                                src={user.photoURL}
                                alt="Profile"
                                className="w-12 h-12 rounded-full object-cover border"
                                onError={() => setImgError(true)}
                            />
                        ) : (
                            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center border">
                                <FontAwesomeIcon icon={faCircleUser} className="text-gray-400 text-3xl" />
                            </div>
                        )}

                        <div className="flex flex-col">
                            <p className="font-semibold text-sm truncate w-32">
                                {user.displayName || 'No Name'}
                            </p>
                            <p className="text-xs text-gray-500 truncate w-32">
                                {user.email}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Middle container: stretch and center streak grid */}
            <div className="flex-grow flex items-center justify-center">
                <StreakGrid />
            </div>

            {/* Logout button at bottom */}
            <button
                onClick={handleLogout}
                className="bg-white hover:bg-gray-200 transition text-logs1 px-4 py-2 rounded"
            >
                Logout
            </button>
        </div>

    )
}