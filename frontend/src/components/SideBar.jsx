import { signOut } from 'firebase/auth'
import { auth } from '../firebaseConfig'
import logo from '../logo.png'

export function SideBar({ onLogout }) {
    const handleLogout = async () => {
        try {
            await signOut(auth)
            onLogout() // will call setUser(null) in App
        } catch (err) {
            console.error("Error during sign out:", err)
        }
    }

    return (
        <div className="flex flex-col justify-between h-screen w-60 bg-logs2 text-black p-4">
            <div className="flex justify-center mb-8">
                <img src={logo} alt="Logo" className="w-32 h-auto" />
            </div>

            <div></div>

            <button
                onClick={handleLogout}
                className="bg-white hover:bg-gray-200 transition text-logs1 px-4 py-2 rounded"
            >
                Logout
            </button>
        </div>
    )
}