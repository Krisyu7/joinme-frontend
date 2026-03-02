'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { ApiResponse } from '@/lib/types'
import Navbar from '@/components/Navbar'

const SPORTS = ['FOOTBALL', 'BADMINTON', 'BASKETBALL', 'TENNIS', 'VOLLEYBALL', 'OTHER']
const SPORT_ICONS: Record<string, string> = {
    FOOTBALL: '⚽',
    BADMINTON: '🏸',
    BASKETBALL: '🏀',
    TENNIS: '🎾',
    VOLLEYBALL: '🏐',
    OTHER: '🏃',
}

interface UserProfile {
    userId: number
    name: string
    email: string
    city?: string
    sports?: string[]
    kudosCount: number
    attendCount: number
    attendRate: number
}

export default function ProfilePage() {

    const router = useRouter()
    const { user, isAuthenticated, login, token,authLoading } = useAuth()
    const [loading, setLoading] = useState(false)
    const [editing, setEditing] = useState(false)
    const [message, setMessage] = useState('')
    const [form, setForm] = useState({
        name: user?.name || '',
        city: '',
        sports: [] as string[],
    })

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login')
            return
        }
        if (!authLoading && isAuthenticated) {
            fetchProfile()
        }
    }, [isAuthenticated, authLoading, router])

    const fetchProfile = async () => {
        try {
            const res = await api.get<ApiResponse<UserProfile>>(`/api/users/me`)
            const profile = res.data.data
            setForm({
                name: profile.name,
                city: profile.city || '',
                sports: profile.sports || [],
            })
        } catch (err) {
            console.error(err)
        }
    }

    const toggleSport = (sport: string) => {
        setForm(prev => ({
            ...prev,
            sports: prev.sports.includes(sport)
                ? prev.sports.filter(s => s !== sport)
                : [...prev.sports, sport]
        }))
    }

    const handleSave = async () => {
        setLoading(true)
        setMessage('')
        try {
            const res = await api.put<ApiResponse<UserProfile>>('/api/users/me', form)
            const updated = res.data.data
            if (token) {
                login(token, {
                    userId: updated.userId,
                    name: updated.name,
                    email: updated.email,
                    attendCount: updated.attendCount,
                    attendRate: updated.attendRate,
                    kudosCount: updated.kudosCount,
                })
            }
            setMessage('Profile updated!')
            setEditing(false)
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } }
            setMessage(error.response?.data?.message || 'Failed to update')
        } finally {
            setLoading(false)
        }
    }

    if (authLoading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="text-gray-500">Loading...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <Navbar />
            <main className="max-w-xl mx-auto px-6 py-8">
                <h1 className="text-3xl font-black mb-8">Profile</h1>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
                        <div className="text-2xl font-black text-green-400">{user?.kudosCount || 0}</div>
                        <div className="text-xs text-gray-500 mt-1">Kudos</div>
                    </div>
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
                        <div className="text-2xl font-black text-green-400">{user?.attendCount || 0}</div>
                        <div className="text-xs text-gray-500 mt-1">Games</div>
                    </div>
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
                        <div className="text-2xl font-black text-green-400">
                            {Math.round((user?.attendRate || 0) * 100)}%
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Attendance</div>
                    </div>
                </div>

                {/* Profile Card */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-4">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-green-400/20 border border-green-400/30 flex items-center justify-center text-2xl font-black text-green-400">
                                {user?.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h2 className="font-bold text-lg">{user?.name}</h2>
                                <p className="text-gray-500 text-sm">{user?.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setEditing(!editing)}
                            className="text-gray-400 hover:text-white text-sm transition-colors"
                        >
                            {editing ? 'Cancel' : 'Edit'}
                        </button>
                    </div>

                    {editing ? (
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-gray-400 mb-1.5 block">Name</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-400 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-400 mb-1.5 block">City</label>
                                <input
                                    type="text"
                                    value={form.city}
                                    onChange={e => setForm({ ...form, city: e.target.value })}
                                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-400 transition-colors"
                                    placeholder="Victoria, BC"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-400 mb-2 block">Sports you play</label>
                                <div className="flex gap-2 flex-wrap">
                                    {SPORTS.map(sport => (
                                        <button
                                            key={sport}
                                            type="button"
                                            onClick={() => toggleSport(sport)}
                                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                                                form.sports.includes(sport)
                                                    ? 'bg-green-400 text-gray-950'
                                                    : 'bg-gray-800 text-gray-400 hover:text-white'
                                            }`}
                                        >
                                            {SPORT_ICONS[sport]} {sport.charAt(0) + sport.slice(1).toLowerCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="w-full bg-green-400 hover:bg-green-300 text-gray-950 font-bold rounded-xl py-3 text-sm transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-gray-500">📍</span>
                                <span className="text-gray-300">{form.city || 'No city set'}</span>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                                {form.sports.length > 0 ? form.sports.map(sport => (
                                    <span key={sport} className="text-sm px-3 py-1 rounded-full bg-green-400/10 text-green-400 border border-green-400/20">
                                        {SPORT_ICONS[sport]} {sport.charAt(0) + sport.slice(1).toLowerCase()}
                                    </span>
                                )) : (
                                    <span className="text-gray-500 text-sm">No sports added yet</span>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {message && (
                    <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-sm rounded-lg px-4 py-3">
                        {message}
                    </div>
                )}
            </main>
        </div>
    )
}