'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { ApiResponse } from '@/lib/types'

interface AuthResponse {
    token: string
    userId: number
    name: string
    email: string
}

const SPORTS = ['FOOTBALL', 'BADMINTON', 'BASKETBALL', 'TENNIS', 'VOLLEYBALL']
const SPORT_ICONS: Record<string, string> = {
    FOOTBALL: '⚽',
    BADMINTON: '🏸',
    BASKETBALL: '🏀',
    TENNIS: '🎾',
    VOLLEYBALL: '🏐',
}

export default function RegisterPage() {
    const router = useRouter()
    const { login } = useAuth()
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        city: '',
    })


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const res = await api.post<ApiResponse<AuthResponse>>('/api/auth/register', form)
            const {token, userId, name, email} = res.data.data
            login(token, {
                userId,
                name,
                email,
                attendCount: 0,
                attendRate: 0,
                kudosCount: 0,
            })
            router.push('/')
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } }
            setError(error.response?.data?.message || 'Registration failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-10">
                    <h1 className="text-5xl font-black text-white tracking-tight">
                        Join<span className="text-green-400">Me</span>
                    </h1>
                    <p className="text-gray-400 mt-2 text-sm">Create your account and start playing.</p>
                </div>

                <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
                    <h2 className="text-xl font-bold text-white mb-6">Create account</h2>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg px-4 py-3 mb-6">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-sm text-gray-400 mb-1.5 block">Name</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-green-400 transition-colors"
                                placeholder="Your name"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-sm text-gray-400 mb-1.5 block">Email</label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })}
                                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-green-400 transition-colors"
                                placeholder="you@example.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-sm text-gray-400 mb-1.5 block">Password</label>
                            <input
                                type="password"
                                value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })}
                                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-green-400 transition-colors"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-sm text-gray-400 mb-1.5 block">City</label>
                            <input
                                type="text"
                                value={form.city}
                                onChange={e => setForm({ ...form, city: e.target.value })}
                                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-green-400 transition-colors"
                                placeholder="Victoria, BC"
                            />
                        </div>



                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-green-400 hover:bg-green-300 text-gray-950 font-bold rounded-lg py-3 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                        >
                            {loading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </form>

                    <p className="text-center text-gray-500 text-sm mt-6">
                        Already have an account?{' '}
                        <Link href="/login" className="text-green-400 hover:text-green-300 font-medium">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}