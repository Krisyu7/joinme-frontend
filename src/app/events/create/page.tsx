'use client'

import {useEffect, useState} from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { ApiResponse, Event } from '@/lib/types'
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

export default function CreateEventPage() {
    const router = useRouter()
    const { isAuthenticated,authLoading} = useAuth()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [form, setForm] = useState({
        title: '',
        sportType: '',
        locationName: '',
        startTime: '',
        maxSpots: 10,
        reservedSpots: 0,
        requireApproval: false,
        skillRequirement: 'ALL',
        feeDescription: '',
        cancelDeadlineHours: 2,
    })

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login')
        }
    }, [isAuthenticated, authLoading, router])


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const res = await api.post<ApiResponse<Event>>('/api/events', {
                ...form,
                startTime: new Date(form.startTime).toISOString().slice(0, 19),
            })
            router.push(`/events/${res.data.data.id}`)
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } }
            setError(error.response?.data?.message || 'Failed to create event')
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
                <h1 className="text-3xl font-black mb-8">
                    Create a <span className="text-green-400">Game</span>
                </h1>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg px-4 py-3 mb-6">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Title */}
                    <div>
                        <label className="text-sm text-gray-400 mb-1.5 block">Game Title</label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={e => setForm({ ...form, title: e.target.value })}
                            className="w-full bg-gray-900 border border-gray-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-400 transition-colors"
                            placeholder="Sunday Football Drop-in"
                            required
                        />
                    </div>

                    {/* Sport Type */}
                    <div>
                        <label className="text-sm text-gray-400 mb-2 block">Sport</label>
                        <div className="flex gap-2 flex-wrap">
                            {SPORTS.map(sport => (
                                <button
                                    key={sport}
                                    type="button"
                                    onClick={() => setForm({ ...form, sportType: sport })}
                                    className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                                        form.sportType === sport
                                            ? 'bg-green-400 text-gray-950'
                                            : 'bg-gray-900 border border-gray-800 text-gray-400 hover:text-white'
                                    }`}
                                >
                                    {SPORT_ICONS[sport]} {sport.charAt(0) + sport.slice(1).toLowerCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Location */}
                    <div>
                        <label className="text-sm text-gray-400 mb-1.5 block">Location</label>
                        <input
                            type="text"
                            value={form.locationName}
                            onChange={e => setForm({ ...form, locationName: e.target.value })}
                            className="w-full bg-gray-900 border border-gray-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-400 transition-colors"
                            placeholder="Topaz Park, Victoria"
                            required
                        />
                    </div>

                    {/* Start Time */}
                    <div>
                        <label className="text-sm text-gray-400 mb-1.5 block">Date & Time</label>
                        <input
                            type="datetime-local"
                            value={form.startTime}
                            onChange={e => setForm({ ...form, startTime: e.target.value })}
                            className="w-full bg-gray-900 border border-gray-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-400 transition-colors"
                            required
                        />
                    </div>

                    {/* Spots */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-gray-400 mb-1.5 block">Total Spots</label>
                            <input
                                type="number"
                                value={form.maxSpots}
                                onChange={e => setForm({ ...form, maxSpots: parseInt(e.target.value) })}
                                className="w-full bg-gray-900 border border-gray-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-400 transition-colors"
                                min={2}
                                required
                            />
                        </div>
                        <div>
                            <label className="text-sm text-gray-400 mb-1.5 block">Reserved Spots</label>
                            <input
                                type="number"
                                value={form.reservedSpots}
                                onChange={e => setForm({ ...form, reservedSpots: parseInt(e.target.value) })}
                                className="w-full bg-gray-900 border border-gray-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-400 transition-colors"
                                min={0}
                            />
                        </div>
                    </div>

                    {/* Skill Level */}
                    <div>
                        <label className="text-sm text-gray-400 mb-2 block">Skill Level</label>
                        <div className="flex gap-2">
                            {['ALL', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'].map(level => (
                                <button
                                    key={level}
                                    type="button"
                                    onClick={() => setForm({ ...form, skillRequirement: level })}
                                    className={`flex-1 py-2 rounded-xl text-xs font-medium transition-colors ${
                                        form.skillRequirement === level
                                            ? 'bg-green-400 text-gray-950'
                                            : 'bg-gray-900 border border-gray-800 text-gray-400 hover:text-white'
                                    }`}
                                >
                                    {level === 'ALL' ? 'All' : level.charAt(0) + level.slice(1).toLowerCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Fee */}
                    <div>
                        <label className="text-sm text-gray-400 mb-1.5 block">Fee Description <span className="text-gray-600">(optional)</span></label>
                        <input
                            type="text"
                            value={form.feeDescription}
                            onChange={e => setForm({ ...form, feeDescription: e.target.value })}
                            className="w-full bg-gray-900 border border-gray-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-400 transition-colors"
                            placeholder="Free / $5 per person"
                        />
                    </div>

                    {/* Cancel Deadline */}
                    <div>
                        <label className="text-sm text-gray-400 mb-1.5 block">Cancel Deadline (hours before start)</label>
                        <input
                            type="number"
                            value={form.cancelDeadlineHours}
                            onChange={e => setForm({ ...form, cancelDeadlineHours: parseInt(e.target.value) })}
                            className="w-full bg-gray-900 border border-gray-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-400 transition-colors"
                            min={0}
                        />
                    </div>

                    {/* Require Approval */}
                    <div className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-xl px-4 py-3">
                        <div>
                            <p className="text-sm font-medium">Require Approval</p>
                            <p className="text-xs text-gray-500">Manually approve each participant</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setForm({ ...form, requireApproval: !form.requireApproval })}
                            className={`w-12 h-6 rounded-full transition-colors relative ${
                                form.requireApproval ? 'bg-green-400' : 'bg-gray-700'
                            }`}
                        >
                            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                                form.requireApproval ? 'translate-x-7' : 'translate-x-1'
                            }`} />
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !form.sportType}
                        className="w-full bg-green-400 hover:bg-green-300 text-gray-950 font-black rounded-xl py-4 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Creating...' : 'Create Game'}
                    </button>
                </form>
            </main>
        </div>
    )
}