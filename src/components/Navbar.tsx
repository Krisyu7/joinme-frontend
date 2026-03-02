'use client'

import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'

export default function Navbar() {
    const { user, logout, isAuthenticated } = useAuth()

    return (
        <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between sticky top-0 bg-gray-950/90 backdrop-blur-sm z-10">
            <Link href="/">
                <h1 className="text-2xl font-black tracking-tight cursor-pointer">
                    Join<span className="text-green-400">Me</span>
                </h1>
            </Link>
            <div className="flex items-center gap-4">
                {isAuthenticated ? (
                    <>
                        <Link href="/notifications" className="text-gray-400 hover:text-white transition-colors">
                            🔔
                        </Link>
                        <Link href="/events/create" className="bg-green-400 hover:bg-green-300 text-gray-950 font-bold px-4 py-2 rounded-lg text-sm transition-colors">
                            + Create
                        </Link>
                        <Link href="/profile" className="text-gray-400 hover:text-white text-sm transition-colors">
                            {user?.name}
                        </Link>
                        <button onClick={logout} className="text-gray-400 hover:text-white text-sm transition-colors">
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link href="/login" className="text-gray-400 hover:text-white text-sm transition-colors">
                            Login
                        </Link>
                        <Link href="/register" className="bg-green-400 hover:bg-green-300 text-gray-950 font-bold px-4 py-2 rounded-lg text-sm transition-colors">
                            Sign Up
                        </Link>
                    </>
                )}
            </div>
        </nav>
    )
}